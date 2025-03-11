import { InjectDiscordClient } from "@discord-nestjs/core";
import { Channel } from "@libs/database/entities/channel.entity";
import { Member } from "@libs/database/entities/member.entity";
import { AppEvents } from "@libs/enums/events.enum";
import { DiscordChannel } from "@libs/types/discord";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { Client, Message } from "discord.js";
import { Repository } from "typeorm";
import { ChannelsService } from "./channels.service";
import { Logger } from "@libs/logger";
import { SHA512 } from "crypto-js";
import { ContentService } from "./content.service";

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

            const discordChannel: DiscordChannel = await this.channelsService.findChannelById(message.channelId)
            const channel: Channel = await this.channel.findOne({ where: { discordId: message.channelId }, relations: ['assignedMember'] });

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

    public displayInviteMessage = async (channelId: string): Promise<void> => {

    }

    public displayServerRules = async (channelId: string): Promise<void> => {

    }

    public askAboutEmail = async (channelId: string): Promise<void> => {

    }

    public askAboutCode = async (channelId: string): Promise<void> => {

    }

}