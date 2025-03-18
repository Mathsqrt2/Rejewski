import { DiscordModule } from "@discord-nestjs/core";
import { TestController } from "./test.controller";
import { BotModule } from "src/discord/bot.module";
import { DatabaseModule } from "@libs/database";
import { EmailerModule } from "@libs/emailer";
import { LoggerModule } from "@libs/logger";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        DiscordModule.forFeature(),
        DatabaseModule,
        EmailerModule,
        LoggerModule,
        BotModule,
    ],
    controllers: [
        TestController
    ],
})

export class TestModule { }