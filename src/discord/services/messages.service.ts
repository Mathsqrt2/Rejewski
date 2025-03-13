import {
    ActionRowBuilder, ButtonBuilder, ButtonComponent,
    ButtonInteraction, ButtonStyle, Client, Events, Message,
    SendableChannels
} from "discord.js";
import { InjectDiscordClient, On } from "@discord-nestjs/core";
import { Channel } from "@libs/database/entities/channel.entity";
import { Member } from "@libs/database/entities/member.entity";
import { BotResponse } from "@libs/enums/responses.enum";
import { ChannelsService } from "./channels.service";
import { AppEvents } from "@libs/enums/events.enum";
import { InjectRepository } from "@nestjs/typeorm";
import { ContentService } from "./content.service";
import { OnEvent } from "@nestjs/event-emitter";
import { Injectable } from "@nestjs/common";
import { Content } from "src/app.content";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";
import { SHA512 } from "crypto-js";
import { DiscordEvents } from "@libs/enums/discord.events.enum";
import { RolesService } from "./roles.service";
import { Roles } from "@libs/enums";

@Injectable()
export class MessagesService {

    constructor(
        @InjectRepository(Channel) private readonly channel: Repository<Channel>,
        @InjectRepository(Member) private readonly member: Repository<Member>,
        @InjectDiscordClient() private readonly client: Client,
        private readonly channelsService: ChannelsService,
        private readonly contentService: ContentService,
        private readonly rolesService: RolesService,
        private readonly logger: Logger,
    ) { }

    @OnEvent(AppEvents.PublicMessage, { async: true })
    private async handlePublicChannelMessage(message: Message): Promise<void> {

        const doesMessageContainMaliciousLinkResult = this.contentService.detectMaliciousLinks(message);
        if (doesMessageContainMaliciousLinkResult) {
            //todo, remove message, warn user, notify admin; 
        }

        const doesMessageContainProfanityResult = this.contentService.detectProfanity(message);
        if (doesMessageContainMaliciousLinkResult) {
            // todo, remove message, warn user, notify admin
        }

    }

    @OnEvent(AppEvents.AdministrationMessage, { async: true })
    private async handleAdministrationChannelMessage(message: Message): Promise<void> {

    }

    @OnEvent(AppEvents.PrivateMessage, { async: true })
    private async handlePrivateChannelMessage(message: Message): Promise<void> {

        const startTime = Date.now();
        try {

            const channel: Channel = await this.channel.findOne({
                where: { discordId: message.channelId },
                relations: ['assignedMember']
            });
            if (!channel) {
                this.logger.error(`Invalid channel.`, { startTime });
            }

            const discordMemberIdHash = SHA512(message.author.id).toString();
            if (channel.assignedMember.discordIdHash !== discordMemberIdHash) {
                this.logger.warn(`Someone else is using client channel. Action suspended.`, { startTime });
                return;
            }

            message.content

        } catch (error) {
            this.logger.error(`Failed to handle private channel message.`, { error, startTime });
        }

    }

    @OnEvent(AppEvents.PersonalMessage, { async: true })
    private async handlePersonalChannelMessage(message: Message): Promise<void> {


    }

    private getSendableChannel = (textChannelId: string): SendableChannels => {

        const channel = this.client.channels.cache.get(textChannelId);
        if (!channel) {
            this.logger.error(`Failed to find specified channel.`);
            throw new Error(`Failed to find specified channel.`);
        }

        if (!channel.isSendable()) {
            this.logger.error(`Specified channel is not sendable.`);
            throw new Error(`Specified channel is not sendable.`);
        }

        return channel;
    }

    private findMessageContent = (type: BotResponse, param?: unknown): string => {
        switch (type) {
            case BotResponse.welcomeNewMember: return Content.messages.welcomeNewMember();
            case BotResponse.welcomeReturningMember: return Content.messages.welcomeReturningMember();
            case BotResponse.askAboutEmail: return Content.messages.askAboutEmail();
            case BotResponse.retryToAskAboutEmail: return Content.messages.retryToAskAboutEmail();
            case BotResponse.respondToStrangeEmailFormat: return Content.messages.respondToStrangeEmailFormat();
            case BotResponse.respondToWrongMessage: return Content.messages.respondToWrongMessage();
            case BotResponse.askAboutCode: return Content.messages.askAboutCode(param?.toString() || null);
            case BotResponse.informAboutWrongCode: return Content.messages.informAboutWrongCode(param?.toString() || null);
            case BotResponse.retryToAskAboutCode: return Content.messages.retryToAskAboutCode();
            case BotResponse.sendServerRules: return Content.messages.sendServerRules();
        }
    }

    public sendMessage = async (channelId: string, type: BotResponse, param?: unknown): Promise<void> => {

        const startTime: number = Date.now();
        try {
            const channel = this.getSendableChannel(channelId);
            const message: string = this.findMessageContent(type, param || null);

            if (!message) {
                throw new Error(`Message from template: "${type}" is empty.`)
            }

            await channel.send(message);
            this.logger.log(`Message sent successfully.`, { startTime });
        } catch (error) {
            this.logger.error(Content.error.failedToDisplayInviteMessage(), { error, startTime })
        }
    }

    public sendRulesButton = async (channelId: string): Promise<void> => {

        const startTime: number = Date.now();
        try {

            const channel = this.getSendableChannel(channelId);
            const button = new ButtonBuilder()
                .setCustomId(DiscordEvents.acceptRules)
                .setLabel(Content.interface.rulesAcceptButton())
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
            await channel.send({
                content: Content.messages.askAboutAcceptanceOfRules(),
                components: [row],
            })

        } catch (error) {
            this.logger.error(`Failed to send rules button.`, { error, startTime });
        }

    }

    public disableRulesButton = async (interaction: ButtonInteraction): Promise<void> => {

        const startTime: number = Date.now();
        const originalMessage = await interaction.channel?.messages.fetch(interaction.message.id);
        if (!originalMessage) {
            this.logger.warn(`Original message doesn't exist`, { startTime });
            return;
        }

        const button = new ButtonBuilder()
            .setCustomId(DiscordEvents.cancelRulesAcceptance)
            .setLabel(Content.interface.cancelRulesAcceptance())
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
        await originalMessage.edit({
            content: interaction.message?.content,
            components: [row],
        })
    }


}