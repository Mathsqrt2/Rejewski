import { DiscordModule } from "@discord-nestjs/core";
import { Module } from "@nestjs/common";
import { TestController } from "./test.controller";
import { BotModule } from "src/discord/bot.module";
import { LoggerModule } from "@libs/logger";
import { DatabaseModule } from "@libs/database";

@Module({
    imports: [
        DiscordModule.forFeature(),
        DatabaseModule,
        LoggerModule,
        BotModule,
    ],
    controllers: [
        TestController
    ],
})

export class TestModule { }