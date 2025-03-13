import { databaseEntities } from "@libs/database/database.providers";
import { VerificationModule } from "@libs/verification";
import { DiscordModule } from "@discord-nestjs/core";
import { DatabaseModule } from "@libs/database";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SettingsModule } from "@libs/settings";
import { EmailerModule } from "@libs/emailer";
import { GatewayModule } from "@libs/gateway";
import { LoggerModule } from "@libs/logger";
import { BotGateway } from "./bot.gateway";
import { Module } from "@nestjs/common";
import { MessagesService } from "./services/messages.service";
import { MembersService } from "./services/members.service";
import { ChannelsService } from "./services/channels.service";
import { RolesService } from "./services/roles.service";
import { ContentService } from "./services/content.service";
import { InteractionService } from "./services/interaction.service";

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
        InteractionService,
        ChannelsService,
        MessagesService,
        ContentService,
        MembersService,
        RolesService,
        BotGateway,
    ],
    exports: [
        InteractionService,
        ChannelsService,
        MessagesService,
        ContentService,
        MembersService,
        RolesService,
        BotGateway,
    ]
})

export class BotModule { }