import { Dictionary } from "@libs/database/entities/dictionary.entity";
import { SettingsService } from "@libs/settings";
import {
    BadRequestException,
    Body, Controller, Delete, Get, HttpCode,
    HttpStatus, InternalServerErrorException, NotFoundException, Param, Post
} from "@nestjs/common";
import { ChannelsService } from "./services/channels.service";
import { MessagesService } from "./services/messages.service";
import { ContentService } from "./services/content.service";
import { AppSettingsDto } from "./dtos/app-settings.dto";
import { RolesService } from "./services/roles.service";
import { AppServiceDto } from "./dtos/app-service.dto";
import { DictionaryDto } from "./dtos/dictionary.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CronNameDto } from "./dtos/cron-name.dto";
import { AppConfig } from "@libs/types/settings";
import { PhraseDto } from "./dtos/phrase.dto";
import { Content } from "src/app.content";
import { Repository } from "typeorm";
import { AppServices } from "@libs/enums/services.enum";
import { MembersService } from "./services/members.service";
import { CronJobs } from "@libs/enums/cron.enum";

@Controller(`api`)
export class DiscordController {

    constructor(
        @InjectRepository(Dictionary) private readonly dictionary: Repository<Dictionary>,
        private readonly settings: SettingsService,
        private readonly messages: MessagesService,
        private readonly channels: ChannelsService,
        private readonly members: MembersService,
        private readonly content: ContentService,
        private readonly roles: RolesService,
    ) { }

    @Get(`config`)
    @HttpCode(HttpStatus.FOUND)
    public getAppConfiguration(): AppConfig {
        return this.settings.app
    }

    @Post(`config`)
    @HttpCode(HttpStatus.ACCEPTED)
    public setAppConfiguration(
        @Body() body: AppSettingsDto
    ): void {
        this.settings.app = body;
    }

    @Get(`blacklist`)
    @HttpCode(HttpStatus.FOUND)
    public async getBlacklistedPhrases(): Promise<Dictionary[]> {

        const phrases = await this.dictionary.find({ where: { blackList: true } });
        if (!phrases) {
            throw new NotFoundException(Content.exceptions.notFound(`Phrases`));
        }

        return phrases
    }

    @Post(`blacklist`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async addPhraseToBlacklist(
        @Body() body: DictionaryDto
    ): Promise<Dictionary[]> {

        const phrases = await Promise.all(body?.phrases.map((phrase: PhraseDto) => (
            this.dictionary.save({ ...phrase, blackList: true })
        )));
        await this.content.updateData();

        return phrases;
    }

    @Delete(`blacklist`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async removePhraseFromBlacklist(
        @Body() body: DictionaryDto
    ): Promise<void> {

        await Promise.all(body.phrases.map((element: PhraseDto) => (
            this.dictionary.delete({ phrase: element.phrase, blackList: true })
        )));
        await this.content.updateData();
    }

    @Delete(`blacklist/clear`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async clearBlacklist(): Promise<void> {
        await this.content.updateData();
        await this.dictionary.delete({ blackList: true });
    }

    @Get(`whitelist`)
    @HttpCode(HttpStatus.FOUND)
    public async getWhitelistedPhrases(): Promise<Dictionary[]> {

        const phrases = await this.dictionary.find({ where: { whiteList: true } });
        if (!phrases) {
            throw new NotFoundException(Content.exceptions.notFound(`Phrases`));
        }

        this.content.updateData();
        return phrases;
    }

    @Post(`whitelist`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async addPhraseToWhitelist(
        @Body() body: DictionaryDto
    ): Promise<Dictionary[]> {

        const phrases = await Promise.all(body.phrases.map((phrase: PhraseDto) => (
            this.dictionary.save({ ...phrase, blackList: true })
        )));

        await this.content.updateData();
        return phrases;
    }

    @Delete(`whitelist`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async removePhraseFromWhitelist(
        @Body() body: DictionaryDto
    ): Promise<void> {

        await Promise.all(body.phrases.map((element: PhraseDto) => (
            this.dictionary.delete({ phrase: element.phrase, whiteList: true })
        )));
        await this.content.updateData();

    }

    @Delete(`whitelist/clear`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async clearWhitelist(): Promise<void> {

        await this.dictionary.delete({ whiteList: true });
        await this.content.updateData();

    }

    @Get(`update/:service`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async forceUpdateServiceData(
        @Param() { service }: AppServiceDto
    ): Promise<void> {

        switch (service) {
            case AppServices.MEMBERS_SERVICE: await this.members.updateMembersInfo();
                break;
            case AppServices.CHANNELS_SERVICE: await this.channels.updateChannelsInfo();
                break;
            case AppServices.ROLES_SERVICE: await this.roles.updateRolesInfo();
                break;
            case AppServices.ALL:
            default:
                throw new BadRequestException(`Specified service not found.`);
        }

    }

    @Post(`cron/update/:cronName`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async updateCron(
        @Param() { cronName }: CronNameDto,
        @Body() body: {}
    ) {



    }

}