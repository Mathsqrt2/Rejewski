import { InjectDiscordClient, Once } from "@discord-nestjs/core";
import { StartLog } from "@libs/database/entities/start_log.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ActivityType, Client } from "discord.js";
import { SettingsService } from "@libs/settings";
import { Injectable } from "@nestjs/common";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";

@Injectable()
export class BotGatewayService {

    constructor(
        @InjectRepository(StartLog) private readonly startLog: Repository<StartLog>,
        @InjectDiscordClient() private readonly client: Client,
        private readonly settings: SettingsService,
        private readonly logger: Logger,
    ) { }

    @Once(`ready`)
    public async onBotReady() {

        this.client.user.setActivity({
            name: `✅ W czym mogę służyć?`,
            type: ActivityType.Custom,
        })

        try {
            await this.startLog.save({
                bot: this.settings.app.name,
                botId: this.client.application.id,
            });
            this.logger.log(`Application launched successfully.`)
        } catch (error) {
            this.logger.error(`Failed to launch application.`, { error });
        }

    }
}