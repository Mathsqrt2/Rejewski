import { Channel } from '@libs/database/entities/channel.entity';
import { BadRequestException, Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Member } from '@libs/database/entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Client, Guild, GuildBasedChannel, GuildChannelManager,
    PermissionsBitField, TextChannel,
    VoiceChannel
} from 'discord.js';
import { Repository } from 'typeorm';
import { SHA512 } from 'crypto-js';
import { DiscordMember } from '@libs/types/discord';
import { Logger } from '@libs/logger';
import { LogsTypes } from '@libs/enums';

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

        const guild: Guild = this.client.guilds.cache.get(process.env.GUILD_ID);

        if (!guild) {
            throw new Error(`Failed to find specified guild.`);
        }


        return true;
    }

    public showValidationChannelToUser = async (discordMember: DiscordMember): Promise<TextChannel | VoiceChannel> => {

        const discordIdHash = SHA512(discordMember.id).toString();
        const startTime = Date.now();

        try {

            const member: Member = await this.member.findOneBy({ discordIdHash });
            if (!member) {
                throw new NotFoundException(`User not found.`)
            }

            let channel: Channel = await this.channel.findOneBy({ memberId: member.id, isDeleted: false });
            if (channel) {
                return await this.createPrivateChannel(discordMember);
            }

            return await this.discoverChannelForUser(discordMember.id);

        } catch (error) {

            this.logger.error(`Failed to show validation channel to user.`, { error, startTime });
            return null;

        }
    }

    public discoverChannelForUser = async (discordId: string): Promise<TextChannel | VoiceChannel> => {

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
                this.logger.warn(`Failed to discorver channel for user ${discordChannel.name}`);
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

            this.logger.error(`Failed to discover channel for user ${discordIdHash}`, { error, startTime });
            return null;

        }
    }

    public createPrivateChannel = async (discordMember: DiscordMember): Promise<TextChannel | VoiceChannel> => {

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
            })

            this.logger.log(`Channel for member ${discordIdHash} created successfully.`, {
                tag: LogsTypes.CHANNEL_CREATED,
                startTime,
            })

            return channel;

        } catch (error) {

            this.logger.error(`Failed to create new channel for user ${discordIdHash}`, { error, startTime });
            return null;

        }
    }

    public findChannelById = async (discordChannelId: string): Promise<TextChannel | VoiceChannel> => {

        const guild: Guild = this.client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            throw new Error(`Failed to find guild ${guild.id}.`);
        }

        const channel: GuildBasedChannel = guild.channels.cache.get(discordChannelId);

        if (!channel || !(channel instanceof TextChannel) || !channel.isVoiceBased()) {
            throw new Error(`Failed to find correct channel.`);
        }

        return channel;
    }

}