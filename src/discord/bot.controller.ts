import { Dictionary } from "@libs/database/entities/dictionary.entity";
import { SettingsService } from "@libs/settings";
import {
    Body, Controller, Delete, Get, HttpCode,
    HttpStatus, NotFoundException, Param, Post
} from "@nestjs/common";
import { ChannelsService } from "./services/channels.service";
import { MessagesService } from "./services/messages.service";
import { ContentService } from "./services/content.service";
import { AppSettingsDto } from "./dtos/app.settings.dto";
import { DictionaryDto } from "./dtos/dictionary.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { AppConfig } from "@libs/types/settings";
import { PhraseDto } from "./dtos/phrase.dto";
import { Repository } from "typeorm";
import { Content } from "src/app.content";

@Controller(`api`)
export class DiscordController {

    constructor(
        @InjectRepository(Dictionary) private readonly dictionary: Repository<Dictionary>,
        private readonly settings: SettingsService,
        private readonly messages: MessagesService,
        private readonly channels: ChannelsService,
        private readonly content: ContentService,
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
        this.settings.app = body.settings;
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
        const phrases = Promise.all(body.phrases.map((phrase: PhraseDto) => (
            this.dictionary.save({ ...phrase, blackList: true })
        )));

        this.content.updateData();
        return phrases;
    }

    @Delete(`blacklist`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async removePhraseFromBlacklist(
        @Body() body: DictionaryDto
    ): Promise<void> {

        Promise.all(body.phrases.map((element: PhraseDto) => (
            this.dictionary.delete({ phrase: element.phrase, blackList: true })
        )));
        this.content.updateData();
    }

    @Delete(`blacklist/clear`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async clearBlacklist(): Promise<void> {

        await this.dictionary.delete({ blackList: true });
        this.content.updateData();

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
        const phrases = Promise.all(body.phrases.map((phrase: PhraseDto) => (
            this.dictionary.save({ ...phrase, blackList: true })
        )));

        this.content.updateData();
        return phrases;
    }

    @Delete(`whitelist`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async removePhraseFromWhitelist(
        @Body() body: DictionaryDto
    ): Promise<void> {

        Promise.all(body.phrases.map((element: PhraseDto) => (
            this.dictionary.delete({ phrase: element.phrase, whiteList: true })
        )));
        this.content.updateData();
    }

    @Delete(`whitelist/clear`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async clearWhitelist(): Promise<void> {

        await this.dictionary.delete({ whiteList: true });
        this.content.updateData();
    }

    @Get(`update/:service`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async forceUpdateServiceData(
        @Param(`service`) service: string
    ): Promise<void> {

        let appService: string;

    }

    @Post(`cron/update/:cronName`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async updateCron() {

    }

}