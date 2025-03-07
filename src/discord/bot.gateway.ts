import { InjectDiscordClient, On, Once } from "@discord-nestjs/core";
import { MessagesService } from "./services/messages.service";
import { ChannelsService } from "./services/channels.service";
import { MembersService } from "./services/members.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SettingsService } from "@libs/settings";
import { Injectable } from "@nestjs/common";
import { LogsTypes } from "@libs/enums/logs.enum";
import { Logger } from "@libs/logger";
import {
    ActivityType, Client, GuildMember,
    PartialGuildMember
} from "discord.js";

@Injectable()
export class BotGateway {

    constructor(
        @InjectDiscordClient() private readonly client: Client,
        private readonly messagesService: MessagesService,
        private readonly channelsService: ChannelsService,
        private readonly memberService: MembersService,
        private readonly settings: SettingsService,
        private readonly logger: Logger,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    public async removeUnusedChannels(): Promise<void> {
        await this.channelsService.removeUnusedChannels();
        await this.channelsService.updateChannelsInfo();
    }

    @Cron(CronExpression.EVERY_MINUTE)
    public async updateChannelInfo(): Promise<void> {
        await this.channelsService.updateChannelsInfo();
    }

    @Once(`ready`)
    public async onBotReady() {

        const startTime = Date.now();
        this.client.user.setActivity({
            name: `✅ W czym mogę służyć?`,
            type: ActivityType.Custom,
        })

        try {

            this.logger.log(`Application ${this.settings.app.name} (${this.client.application.id}) has launched successfully.`, {
                tag: LogsTypes.INTERNAL_ACTION,
                startTime,
            })

        } catch (error) {
            this.logger.error(`Failed to launch application.`, { error });
        }

    }

    @On(`guildMemberRemove`)
    public async onMemberLeft(discordMember: GuildMember | PartialGuildMember): Promise<void> {

    }

    @On(`guildMemberAdd`)
    public async onMemberJoin(discordMember: GuildMember | PartialGuildMember): Promise<void> {

        const member = await this.memberService.saveMember(discordMember.id);
        if (!member) {
            this.logger.log(`Failed to validate user`);
        }

        const channel = await this.channelsService.showValidationChannelToUser(discordMember);

    }
}