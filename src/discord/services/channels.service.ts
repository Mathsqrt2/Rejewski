import { Channel } from '@libs/database/entities/channel.entity';
import {
    Client, Guild, GuildBasedChannel, GuildChannelManager,
    PermissionsBitField, TextChannel
} from 'discord.js';
import {
    BadRequestException, Injectable, NotFoundException,
    OnApplicationBootstrap
} from '@nestjs/common';
import { Member } from '@libs/database/entities/member.entity';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SHA512 } from 'crypto-js';
import {
    DiscordChannel, DiscordChannelType,
    DiscordMember
} from '@libs/types/discord';
import { LogsTypes } from '@libs/enums';
import { Logger } from '@libs/logger';

@Injectable()
export class ChannelsService implements OnApplicationBootstrap {

    private channels: Channel[] = [];

    constructor(
        @InjectRepository(Channel) private readonly channel: Repository<Channel>,
        @InjectRepository(Member) private readonly member: Repository<Member>,
        @InjectDiscordClient() private readonly client: Client,
        private readonly logger: Logger,
    ) { }

    public async onApplicationBootstrap() {
        this.channels = await this.channel.find();
    }

    public updateChannelsInfo = async (): Promise<boolean> => {

        const startTime: number = Date.now();
        const guild: Guild = this.client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            throw new Error(`Failed to find specified guild.`);
        }

        const discordChannels = await guild.channels.fetch();
        const channels: Channel[] = await this.channel.find({ where: { isDeleted: false } });
        for (const channel of channels) {
            if (!discordChannels.some(discordChannel => discordChannel.id === channel.discordId)) {
                this.channel.save({ ...channel, isDeleted: true });
                this.channels.filter(c => c.discordId !== channel.discordId)
            }
        }

        const newDiscordChannels = discordChannels.filter(discordChannel =>
            !this.channels.some(channel => channel.discordId === discordChannel.id) &&
            (!discordChannel.parentId || discordChannel.parentId !== process.env.NEW_MEMBERS_PARENT)
        );

        await Promise.all(newDiscordChannels.map(discordChannel => this.channel.save({
            discordId: discordChannel.id,
            isAdministration: discordChannel?.parentId === process.env.ADMINISTRATION_PARENT,
            isPrivate:
                discordChannel?.parentId === process.env.PRIVATE_PARENT
        })));

        this.logger.log(`Channels refreshed successfully.`, { startTime });
        return true;
    }

    public showValidationChannelToUser = async (discordMember: DiscordMember): Promise<TextChannel> => {

        const discordIdHash = SHA512(discordMember.id).toString();
        const startTime: number = Date.now();

        try {

            const member: Member = await this.member.findOneBy({ discordIdHash });
            if (!member) {
                throw new NotFoundException(`Member not found.`)
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

    public discoverChannelForUser = async (discordMemberId: string): Promise<TextChannel> => {

        const guild: Guild = this.client.guilds.cache.get(process.env.GUILD_ID);
        const discordIdHash = SHA512(discordMemberId).toString();
        const startTime: number = Date.now();

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

            const discordChannel = await guild.channels.fetch(channel.discordId) as TextChannel;
            if (!discordChannel) {
                this.channel.save({ ...channel, isDeleted: true });
                this.channels = this.channels.filter(channel => channel.discordId !== discordChannel.id);
                this.logger.error(`Failed to discorver channel for user ${discordChannel.name}`, {
                    tag: LogsTypes.INTERNAL_ACTION_FAIL,
                    startTime
                });
                return;
            }

            await discordChannel.permissionOverwrites.edit(discordMemberId, {
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

    public createPrivateChannel = async (discordMember: DiscordMember): Promise<TextChannel> => {

        const name: string = discordMember.displayName || discordMember.nickname || discordMember.id;
        const channelsManager: GuildChannelManager = discordMember.guild.channels;
        const discordIdHash = SHA512(discordMember.id).toString()
        const startTime: number = Date.now();

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
                parent: process.env.NEW_MEMBERS_PARENT,
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

            this.channels.push(await this.channel.save({
                memberId: member.id,
                discordId: channel.id,
                isPrivate: true,
                isTesting: member.isTester
            }));

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

    public findDiscordChannelById = async (discordChannelId: string): Promise<DiscordChannel> => {

        const guild: Guild = this.client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            throw new Error(`Failed to find guild ${guild.id}.`);
        }

        const channel: GuildBasedChannel = await guild.channels.fetch(discordChannelId);
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
            } else if (channel.isPrivate) {
                return `private`;
            } else if (!channel.isPersonal && !channel.isPrivate && !channel.isAdministration) {
                return `public`;
            } else {
                throw new Error(`Unknown channel type.`);
            }

        } catch (error) {
            this.logger.warn(`Failed to recognize channel type ${discordChannelId}, ${error?.message}.`, {
                tag: LogsTypes.VALIDATION_FAIL,
                startTime,
            });
            return null;
        }
    }

    public removeDiscordChannel = async (discordChannelId: string, reason?: string): Promise<void> => {

        const startTime: number = Date.now();
        try {

            const guild: Guild = this.client.guilds.cache.get(process.env.GUILD_ID);

            const discordChannel = await guild.channels.fetch(discordChannelId) as TextChannel;
            const channel = await this.channel.findOne({ where: { discordId: discordChannelId } });

            await discordChannel.delete(reason || null);
            this.channel.save({ ...channel, isDeleted: true });

            this.logger.log(`Channel removed successfully,`, { startTime });
        } catch (error) {
            this.logger.error(`Failed to remove discord channel.`, { startTime });
        }
    }

    public isChannelTesting = (discordId: string): boolean => {
        return this.channels.some(channel => (
            channel.discordId === discordId &&
            channel.isTesting
        ))
    }

}