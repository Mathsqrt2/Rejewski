import { InjectDiscordClient } from "@discord-nestjs/core";
import { BotResponse } from "@libs/enums";
import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { Client } from "discord.js";
import { MessagesService } from "src/discord/services/messages.service";
import { SendMessageDto } from "./dtos/sendMessage.Dto";
import { Logger } from "@libs/logger";

@Controller(`api/test`)
export class TestController {

    constructor(
        @InjectDiscordClient() private readonly client: Client,
        private readonly messagesService: MessagesService,
        private readonly logger: Logger,
    ) { }


    @Get(`:channelId/:messageType`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async sendMessage(
        @Param() params: SendMessageDto,
    ): Promise<void> {

        const { channelId, messageType } = params;

        const startTime: number = Date.now();
        try {

            await this.messagesService.sendMessage(channelId, messageType);

        } catch (error) {
            this.logger.error(`Failed to force sending message with ${params}`, { error, startTime })
        }

    }

}