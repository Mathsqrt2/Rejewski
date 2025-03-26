import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Member } from '@libs/database/entities/member.entity';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { LogsTypes } from '@libs/enums';
import { Logger } from '@libs/logger';
import { Repository } from 'typeorm';
import { Client, Guild, PermissionsBitField } from 'discord.js';
import { SHA512 } from 'crypto-js'

@Injectable()
export class MembersService implements OnApplicationBootstrap {

    private members: Member[] = [];

    constructor(
        @InjectRepository(Member) private readonly member: Repository<Member>,
        @InjectDiscordClient() private readonly client: Client,
        private readonly logger: Logger,
    ) { }

    public async onApplicationBootstrap() {
        this.members = await this.member.find();
        await this.updateMembersInfo();
    }

    public updateMembersInfo = async (): Promise<boolean> => {

        const startTime: number = Date.now();
        const guild: Guild = this.client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            throw new Error(`Failed to find specified guild.`);
        }

        const discordMembers = await guild.members.fetch();
        const newDiscordMembers = discordMembers.filter(discordMember => {
            const memberDiscordIdHash: string = SHA512(discordMember.id).toString();
            return !this.members.some(member => member.discordIdHash === memberDiscordIdHash);
        })

        await Promise.all(newDiscordMembers.map(discordMember => {
            const discordIdHash: string = SHA512(discordMember.id).toString();
            const isAdmin: boolean = discordMember.roles.cache.some(role => (
                role.permissions.has(PermissionsBitField.Flags.Administrator)
            ));
            const isConfirmed: boolean = isAdmin;
            return this.member.save({ discordIdHash, isAdmin, isConfirmed });
        }));

        this.logger.log(`Members refreshed successfully.`, { startTime });

        return true;
    }

    public saveMember = async (memberDiscordId: string): Promise<[Member, boolean]> => {
        const startTime = Date.now();
        let isMemberNew: boolean = false;

        try {
            const discordIdHash = SHA512(memberDiscordId).toString();
            let member: Member = await this.member.findOne({
                where: { discordIdHash },
                relations: [`channels`],
            });

            if (!member) {

                member = await this.member.save({ discordIdHash });
                isMemberNew = true;
                this.members.push(member);
                this.logger.log(`New member ${discordIdHash} joined to the server.`, {
                    tag: LogsTypes.USER_JOINED,
                    startTime
                }
                );

            } else {

                this.logger.log(`Member ${discordIdHash} found in database.`, {
                    tag: LogsTypes.DATABASE_READ,
                    startTime
                }
                );

            }

            return [member, isMemberNew];

        } catch (error) {

            this.logger.error(`Failed to validate member presence.`, {
                tag: LogsTypes.DATABASE_FAIL,
                error,
                startTime
            });

            return null;
        }
    }

    public isAccountTesting = (discordId: string): boolean => {
        const discordIdHash = SHA512(discordId).toString();
        return this.members.some(member => (
            member.discordIdHash === discordIdHash &&
            member.isTester
        ));
    }

}