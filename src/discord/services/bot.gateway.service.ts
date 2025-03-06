import { InjectDiscordClient, Once } from "@discord-nestjs/core";
import { StartLog } from "@libs/database/TypeORM/start_log.entity";
import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ActivityType, Client } from "discord.js";
import { Repository } from "typeorm";

@Injectable()
export class BotGatewayService implements OnApplicationBootstrap {

    constructor(
        @InjectRepository(StartLog) private readonly startLog: Repository<StartLog>,
        @InjectDiscordClient() private readonly client: Client,
    ) { }

    public async onApplicationBootstrap() {

        console.log(this.client.application)
    }

    @Once(`ready`)
    public async onBotReady() {

        this.client.user.setActivity({
            name: `✅ W czym mogę służyć?`,
            type: ActivityType.Custom,
        })

        try {
            await this.startLog.save({ bot: `Rejewski` });
        } catch (error) {

        }

    }
}