import { databaseEntities } from "@libs/database/database.providers";
import { BotGatewayService } from "./services/bot.gateway.service";
import { VerificationModule } from "@libs/verification";
import { DatabaseModule } from "@libs/database";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailerModule } from "@libs/emailer";
import { GatewayModule } from "@libs/gateway";
import { Module } from "@nestjs/common";
import { DiscordModule } from "@discord-nestjs/core";

@Module({
    imports: [
        TypeOrmModule.forFeature([...databaseEntities]),
        DiscordModule.forFeature(),
        VerificationModule,
        DatabaseModule,
        GatewayModule,
        EmailerModule,
    ],
    providers: [
        BotGatewayService
    ]
})

export class BotModule { }