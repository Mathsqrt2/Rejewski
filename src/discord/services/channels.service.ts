import { Channel } from '@libs/database/entities/channel.entity';
import {
    BadRequestException, Injectable, NotFoundException,
    OnApplicationBootstrap
} from '@nestjs/common';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Member } from '@libs/database/entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
    ChannelType,
    Client, Guild, GuildBasedChannel, GuildChannelManager,
    PermissionsBitField, TextChannel,
    VoiceChannel
} from 'discord.js';
import { Repository } from 'typeorm';
import { SHA512 } from 'crypto-js';
import { DiscordChannel, DiscordChannelType, DiscordMember } from '@libs/types/discord';
import { Logger } from '@libs/logger';
import { LogsTypes } from '@libs/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChannelsService implements OnApplicationBootstrap {

    private channels: Channel[] = [];

    constructor(
        @InjectRepository(Channel) private readonly channel: Repository<Channel>,
        @InjectRepository(Member) private readonly member: Repository<Member>,
        @InjectDiscordClient() private readonly client: Client,
        private readonly eventEmitter: EventEmitter2,
        private readonly logger: Logger,
    ) { }

    public async onApplicationBootstrap() {
        this.channels = await this.channel.find();
    }

    public updateChannelsInfo = async (): Promise<boolean> => {

        const guild: Guild = this.client.guilds.cache.get(process.env.GUILD_ID);

        if (!guild) {
            throw new Error(`Failed to find specified guild.`);
        }

        const channels: Channel[] = await this.channel.find({ where: { isDeleted: false } });

        for (const channel of channels) {
            const discordChannel = guild.channels.cache.get(channel.discordId);
            if (!discordChannel) {
                this.channel.save({ ...channel, isDeleted: true });
                this.channels.filter(c => c.discordId !== channel.discordId)
            }
        }

        return true;
    }

    public showValidationChannelToUser = async (discordMember: DiscordMember): Promise<DiscordChannel> => {

        const discordIdHash = SHA512(discordMember.id).toString();
        const startTime = Date.now();

        try {

            const member: Member = await this.member.findOneBy({ discordIdHash });
            if (!member) {
                throw new NotFoundException(`User not found.`)
            }

            let channel: Channel = await this.channel.findOneBy({ memberId: member.id, isDeleted: false });
            if (!channel) {
                return await this.createPrivateChannel(discordMember);
            }

            return await this.discoverChannelForUser(discordMember.id);

        } catch (error) {

            this.logger.error(`Failed to show validation channel to user.`, {
                tag: LogsTypes.VALIDATION_FAIL,
                error,
                startTime
            });
            return null;

        }
    }

    public discoverChannelForUser = async (discordId: string): Promise<DiscordChannel> => {

        const guild: Guild = this.client.guilds.cache.get(process.env.GUILD_ID);
        const discordIdHash = SHA512(discordId).toString();
        const startTime = Date.now();

        try {

            if (!guild) {
                throw new Error(`Failed to find specified guild.`);
            }

            const member = await this.member.findOneBy({ discordIdHash });
            if (!member) {
                throw new Error(`Failed to find specified member ${discordIdHash}`);
            }

            const channel: Channel = await this.channel.findOne({
                where: { memberId: member.id, isDeleted: false }
            });

            const discordChannel = guild.channels.cache.get(channel.discordId) as TextChannel | VoiceChannel;
            if (!discordChannel) {
                this.channel.save({ ...channel, isDeleted: true });
                this.channels = this.channels.filter(channel => channel.discordId !== discordChannel.id);
                this.logger.error(`Failed to discorver channel for user ${discordChannel.name}`, {
                    tag: LogsTypes.INTERNAL_ACTION_FAIL,
                    startTime
                });
                return;
            }

            await discordChannel.permissionOverwrites.edit(discordId, {
                ReadMessageHistory: true,
                SendMessages: true,
                AddReactions: true,
                ViewChannel: true,
            });

            return discordChannel;

        } catch (error) {

            this.logger.error(`Failed to discover channel for user ${discordIdHash}`, {
                tag: LogsTypes.INTERNAL_ACTION_FAIL,
                error,
                startTime,
            });
            return null;

        }
    }

    public createPrivateChannel = async (discordMember: DiscordMember): Promise<DiscordChannel> => {

        const name: string = discordMember.displayName || discordMember.nickname || discordMember.id;
        const channelsManager: GuildChannelManager = discordMember.guild.channels;
        const discordIdHash = SHA512(discordMember.id).toString()
        const startTime = Date.now();

        try {

            if (!discordMember.guild) {
                throw new BadRequestException(`Missing guild data.`);
            }

            const member = await this.member.findOne({ where: { discordIdHash } });
            if (!member) {
                throw new Error(`Failed to find member: ${discordIdHash}.`)
            }

            const channel: TextChannel = await channelsManager.create({
                name: `${name} access server.`,
                type: 0,
                parent: process.env.NEW_USERS_PARENT,
                permissionOverwrites: [
                    {
                        id: discordMember.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: discordMember.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.AddReactions,
                            PermissionsBitField.Flags.ReadMessageHistory,
                        ]
                    }
                ]
            });

            if (!channel) {
                throw new Error(`Failed to create discord channel.`);
            }

            await this.channel.save({
                memberId: member.id,
                discordId: channel.id,
                isPrivate: true,
            })

            this.logger.log(`Channel for member ${discordIdHash} created successfully.`, {
                tag: LogsTypes.CHANNEL_CREATED,
                startTime,
            })

            return channel;

        } catch (error) {

            this.logger.error(`Failed to create new channel for user ${discordIdHash}`, {
                tag: LogsTypes.CHANNEL_CREATE_FAIL,
                error,
                startTime
            });
            return null;

        }
    }

    public findChannelById = async (discordChannelId: string): Promise<DiscordChannel> => {

        const guild: Guild = this.client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            throw new Error(`Failed to find guild ${guild.id}.`);
        }

        const channel: GuildBasedChannel = guild.channels.cache.get(discordChannelId);

        if (!channel || (!channel.isTextBased() && !channel.isVoiceBased())) {
            throw new Error(`Failed to find correct channel.`);
        }

        return channel as DiscordChannel;
    }

    public removeUnusedChannels = async (): Promise<void> => {

    }

    public findChannelType = async (discordChannelId: string): Promise<DiscordChannelType> => {

        const startTime: number = Date.now();
        try {
            const channel = await this.channel.findOne({ where: { discordId: discordChannelId } });

            if (!channel) {
                await this.channel.save({
                    discordId: discordChannelId,
                })
                return `public`;
            } else if (channel.isPersonal) {
                return `personal`;
            } else if (channel.isAdministration) {
                return `admin`;
            } else if (channel.isPrivate) {
                return `private`;
            } else {
                throw new Error(`Unknown channel type.`);
            }

        } catch (error) {
            this.logger.error(`Failed to recognize channel type.`, {
                tag: LogsTypes.VALIDATION_FAIL,
                error,
                startTime,
            });
            return null;
        }
    }

}