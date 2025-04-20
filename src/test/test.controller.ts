import { MessagesService } from "src/discord/services/messages.service";
import { RolesService } from "src/discord/services/roles.service";
import {
    Controller, Get, HttpCode,
    HttpStatus, NotFoundException, Param
} from "@nestjs/common";
import { InjectDiscordClient } from "@discord-nestjs/core";
import { SendMessageDto } from "./dtos/sendMessage.Dto";
import { BotResponse, LogsTypes, Roles } from "@libs/enums";
import { ChannelDto } from "./dtos/ChannelDto";
import { EmailerService } from "@libs/emailer";
import { Content } from "src/app.content";
import { Logger } from "@libs/logger";
import { Client } from "discord.js";

@Controller(`api/test`)
export class TestController {

    constructor(
        @InjectDiscordClient() private readonly client: Client,
        private readonly messagesService: MessagesService,
        private readonly rolesService: RolesService,
        private readonly emailer: EmailerService,
        private readonly logger: Logger,
    ) { }

    @Get(`:channelId/all`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async sendAllMessages(
        @Param() params: ChannelDto,
    ): Promise<void> {

        const { channelId } = params;
        const startTime: number = Date.now();

        for (const response in BotResponse) {
            try {
                await this.messagesService.sendMessage(channelId, response as BotResponse);
            } catch (error) {
                this.logger.error(`Failed to send ${response}.`,
                    { error, startTime, tag: LogsTypes.RESPONSE_FAIL });
            }
        }
        this.logger.log(Content.log.messageSent(),
            { startTime, tag: LogsTypes.RESPONSE_SUCCESS });
    }

    @Get(`:channelId/button`)
    @HttpCode(HttpStatus.OK)
    public async sendButton(
        @Param() params: ChannelDto,
    ): Promise<void> {

        const { channelId } = params;
        const startTime: number = Date.now();

        try {

            await this.messagesService.sendRulesButton(channelId);
            this.logger.log(Content.log.messageSent(),
                { startTime, tag: LogsTypes.RESPONSE_SUCCESS });

        } catch (error) {
            this.logger.error(`Failed to force sending message with ${params}`,
                { error, startTime, tag: LogsTypes.RESPONSE_FAIL })
        }

    }

    @Get(`:channelId/:messageType/send`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async sendMessage(
        @Param() params: SendMessageDto,
    ): Promise<void> {

        const { channelId, messageType } = params;
        const startTime: number = Date.now();

        try {

            await this.messagesService.sendMessage(channelId, messageType);
            this.logger.log(Content.log.messageSent(),
                { startTime, tag: LogsTypes.RESPONSE_SUCCESS });

        } catch (error) {
            this.logger.error(`Failed to force sending message with ${params}`,
                { error, startTime, tag: LogsTypes.RESPONSE_FAIL })
        }

    }

    @Get(`email`)
    @HttpCode(HttpStatus.OK)
    public async sendEmail() {

        const startTime: number = Date.now();
        try {

            await this.emailer.sendVerificationEmailTo(process.env.TEST_EMAIL, process.env.TEST_CODE);
            this.logger.log(Content.log.messageSent(),
                { startTime, tag: LogsTypes.RESPONSE_SUCCESS });

        } catch (error) {
            this.logger.error(`Failed to send forced verification email.`,
                { error, startTime, tag: LogsTypes.RESPONSE_FAIL });
        }
    }

    @Get(`assign/:memberId/:role`)
    @HttpCode(HttpStatus.OK)
    public async assignRoleToMember(
        @Param(`memberId`) memberId: string,
        @Param(`role`) role: string,
    ): Promise<void> {

        const startTime: number = Date.now();
        const roleKey = Object.keys(Roles).find(key => key === role.toUpperCase());
        if (!roleKey) {
            throw new NotFoundException(Content.exceptions.notFound(`Role`));
        }

        await this.rolesService.assignRoleToMember(memberId, Roles[roleKey]);
        this.logger.log(Content.log.messageSent(),
            { startTime, tag: LogsTypes.RESPONSE_SUCCESS });
    }

    @Get(`remove/:memberId/:role`)
    @HttpCode(HttpStatus.OK)
    public async removeMemberRole(
        @Param(`memberId`) memberId: string,
        @Param(`role`) role: string,
    ): Promise<void> {

        const startTime: number = Date.now();
        const roleKey = Object.keys(Roles).find(key => key === role.toUpperCase());
        if (!roleKey) {
            throw new NotFoundException(Content.exceptions.notFound(`Role`));
        }

        await this.rolesService.removeMemberRole(memberId, Roles[roleKey])
        this.logger.log(Content.log.messageSent(),
            { startTime, tag: LogsTypes.RESPONSE_SUCCESS });
    }
}