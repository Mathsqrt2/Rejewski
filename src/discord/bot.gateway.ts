import {
    ActivityType, Client, GuildMember,
    PartialGuildMember
} from "discord.js";
import { InjectDiscordClient, On, Once } from "@discord-nestjs/core";
import { Log } from "@libs/database/entities/log.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { SettingsService } from "@libs/settings";
import { Injectable } from "@nestjs/common";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class BotGateway {

    constructor(
        @InjectRepository(Log) private readonly log: Repository<Log>,
        @InjectDiscordClient() private readonly client: Client,
        private readonly settings: SettingsService,
        private readonly logger: Logger,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    public async removeUnusedChannels(): Promise<void> {
        // clean channels after users who joined, but never verified.
    }

    @Once(`ready`)
    public async onBotReady() {

        this.client.user.setActivity({
            name: `✅ W czym mogę służyć?`,
            type: ActivityType.Custom,
        })

        try {
            await this.log.save({ content: `${this.settings.app.name}(${this.client.application.id}) launched.` });
            this.logger.log(`Application launched successfully.`)
        } catch (error) {
            this.logger.error(`Failed to launch application.`, { error });
        }

    }

    @On(`guildMemberRemove`)
    public async onUserLeft(member: GuildMember | PartialGuildMember): Promise<void> {

    }

    @On(`guildMemberAdd`)
    public async onUserJoin(member: GuildMember | PartialGuildMember): Promise<void> {



    }
}