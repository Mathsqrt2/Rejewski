import { InjectDiscordClient } from "@discord-nestjs/core";
import { Channel } from "@libs/database/entities/channel.entity";
import { Member } from "@libs/database/entities/member.entity";
import { AppEvents } from "@libs/enums/events.enum";
import { DiscordChannel } from "@libs/types/discord";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { Client, Message, SendableChannels, TextChannel } from "discord.js";
import { Repository } from "typeorm";
import { ChannelsService } from "./channels.service";
import { Logger } from "@libs/logger";
import { SHA512 } from "crypto-js";
import { ContentService } from "./content.service";
import { Content } from "src/app.content";

@Injectable()
export class MessagesService {

    constructor(
        @InjectRepository(Channel) private readonly channel: Repository<Channel>,
        @InjectRepository(Member) private readonly member: Repository<Member>,
        @InjectDiscordClient() private readonly client: Client,
        private readonly channelsService: ChannelsService,
        private readonly contentService: ContentService,
        private readonly logger: Logger,
    ) { }

    @OnEvent(AppEvents.PublicMessage, { async: true })
    public async handlePublicChannelMessage(message: Message): Promise<void> {

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
    public async handleAdministrationChannelMessage(message: Message): Promise<void> {

    }

    @OnEvent(AppEvents.PrivateMessage, { async: true })
    public async handlePrivateChannelMessage(message: Message): Promise<void> {

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




        } catch (error) {
            this.logger.error(`Failed to handle private channel message.`, { error, startTime });
        }

    }

    @OnEvent(AppEvents.PersonalMessage, { async: true })
    public async handlePersonalChannelMessage(message: Message): Promise<void> {


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

    public sendNewMembersInviteMessage = async (textChannelId: string): Promise<void> => {

        const startTime: number = Date.now();
        try {

            const channel = this.getSendableChannel(textChannelId);
            channel.send(Content.messages.message1());

        } catch (error) {

            this.logger.error(Content.error.failedToDisplayInviteMessage(), { error, startTime })

        }

    }

    public sendReturningMembersInviteMessage = async (textChannelId: string): Promise<void> => {

    }

    public sendServerRules = async (channelId: string): Promise<void> => {

    }

    public askAboutEmail = async (channelId: string): Promise<void> => {

    }

    public askAboutCode = async (channelId: string): Promise<void> => {

    }

}