import { Member } from '@libs/database/entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Logger } from '@libs/logger';
import { Repository } from 'typeorm';
import { SHA512 } from 'crypto-js'

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

    public saveMember = async (userDiscordId: string): Promise<Member> => {

        try {
            const discordIdHash = SHA512(userDiscordId).toString();
            let member: Member = await this.member.findOne({ where: { discordIdHash } });

            if (!member) {
                member = await this.member.save({ discordIdHash });
                this.logger.log(`New user ${discordIdHash} joined to the server.`);
            } else {
                this.logger.log(`User ${discordIdHash} found in database.`);
            }

            return member;

        } catch (error) {
            this.logger.error(`Failed to validate user presence.`, { error });
            return null;
        }
    }

}