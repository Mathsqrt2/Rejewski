import { databaseEntities } from "@libs/database/database.providers";
import { InteractionService } from "./services/interaction.service";
import { ChannelsService } from "./services/channels.service";
import { MessagesService } from "./services/messages.service";
import { MembersService } from "./services/members.service";
import { ContentService } from "./services/content.service";
import { RolesService } from "./services/roles.service";
import { VerificationModule } from "@libs/verification";
import { DiscordModule } from "@discord-nestjs/core";
import { DatabaseModule } from "@libs/database";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SettingsModule } from "@libs/settings";
import { EmailerModule } from "@libs/emailer";
import { LoggerModule } from "@libs/logger";
import { BotGateway } from "./bot.gateway";
import { Module } from "@nestjs/common";
import { DiscordController } from "./bot.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([...databaseEntities]),
        DiscordModule.forFeature(),
        VerificationModule,
        DatabaseModule,
        SettingsModule,
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
    controllers: [
        DiscordController,
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