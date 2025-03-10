import { Member } from '@libs/database/entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Logger } from '@libs/logger';
import { Repository } from 'typeorm';
import { SHA512 } from 'crypto-js'
import { LogsTypes } from '@libs/enums';

@Injectable()
export class MembersService implements OnApplicationBootstrap {

    private members: Member[] = [];

    constructor(
        @InjectRepository(Member) private readonly member: Repository<Member>,
        private readonly logger: Logger,
    ) { }

    public async onApplicationBootstrap() {
        this.members = await this.member.find();
    }

    public saveMember = async (memberDiscordId: string): Promise<[Member, boolean]> => {
        const startTime = Date.now();
        let isMemberNew: boolean = false;

        try {
            const discordIdHash = SHA512(memberDiscordId).toString();
            let member: Member = await this.member.findOne({ where: { discordIdHash } });

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

}