import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { MessagesService } from "src/discord/services/messages.service";
import { InjectDiscordClient } from "@discord-nestjs/core";
import { SendMessageDto } from "./dtos/sendMessage.Dto";
import { ChannelDto } from "./dtos/ChannelDto";
import { BotResponse } from "@libs/enums";
import { Logger } from "@libs/logger";
import { Client } from "discord.js";
import { EmailerService } from "@libs/emailer";

@Controller(`api/test`)
export class TestController {

    constructor(
        @InjectDiscordClient() private readonly client: Client,
        private readonly messagesService: MessagesService,
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
                this.logger.error(`Failed to send ${response}.`, { error, startTime });
            }
        }
        this.logger.log(`Messages sent successfully.`, { startTime });
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
            this.logger.log(`Response sent successfully`, { startTime });

        } catch (error) {
            this.logger.error(`Failed to force sending message with ${params}`, { error, startTime })
        }

    }

    @Get(`:channelId/:messageType`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async sendMessage(
        @Param() params: SendMessageDto,
    ): Promise<void> {

        const { channelId, messageType } = params;
        const startTime: number = Date.now();

        try {

            await this.messagesService.sendMessage(channelId, messageType);
            this.logger.log(`Response sent successfully`, { startTime });

        } catch (error) {
            this.logger.error(`Failed to force sending message with ${params}`, { error, startTime })
        }

    }

    @Get(`email`)
    @HttpCode(HttpStatus.OK)
    public async sendEmail() {
        try {

            await this.emailer.sendVerificationEmailTo(process.env.TEST_EMAIL, process.env.TEST_CODE);

        } catch (error) {
            this.logger.error(`Failed to send forced verification email.`, { error });
        }
    }
}