import { databaseEntities } from "@libs/database/database.providers";
import { BotGatewayService } from "./services/bot.gateway.service";
import { VerificationModule } from "@libs/verification";
import { DiscordModule } from "@discord-nestjs/core";
import { DatabaseModule } from "@libs/database";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailerModule } from "@libs/emailer";
import { GatewayModule } from "@libs/gateway";
import { Module } from "@nestjs/common";
import { LoggerModule } from "@libs/logger";
import { SettingsModule } from "@libs/settings";

@Module({
    imports: [
        TypeOrmModule.forFeature([...databaseEntities]),
        DiscordModule.forFeature(),
        VerificationModule,
        DatabaseModule,
        SettingsModule,
        GatewayModule,
        EmailerModule,
        LoggerModule
    ],
    providers: [
        BotGatewayService
    ]
})

export class BotModule { }