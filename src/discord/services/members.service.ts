import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { Client, Guild, PermissionsBitField } from 'discord.js';
import { Member } from '@libs/database/entities/member.entity';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { LogsTypes } from '@libs/enums';
import { Logger } from '@libs/logger';
import { Repository } from 'typeorm';
import { SHA512 } from 'crypto-js'
import { Content } from 'src/app.content';

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
    }

    public updateMembersInfo = async (): Promise<boolean> => {

        const startTime: number = Date.now();
        const guild: Guild = this.client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            throw new NotFoundException(Content.exceptions.notFound(`Guild`));
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

        this.logger.log(Content.log.dataRefreshed(`Members`), { startTime });
        return true;
    }

    public saveMember = async (memberDiscordId: string): Promise<[Member, boolean]> => {
        const startTime: number = Date.now();
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
                this.logger.log(Content.log.memberJoined(discordIdHash), {
                    tag: LogsTypes.USER_JOINED,
                    startTime
                }
                );

            } else {

                this.logger.log(Content.log.memberFound(discordIdHash), {
                    tag: LogsTypes.DATABASE_READ,
                    startTime
                }
                );

            }

            return [member, isMemberNew];

        } catch (error) {

            this.logger.error(Content.error.failedToValidatePresence(), {
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