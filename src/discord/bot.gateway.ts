import { InjectDiscordClient, On, Once } from "@discord-nestjs/core";
import { MessagesService } from "./services/messages.service";
import { ChannelsService } from "./services/channels.service";
import { MembersService } from "./services/members.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SettingsService } from "@libs/settings";
import { Injectable } from "@nestjs/common";
import { LogsTypes } from "@libs/enums/logs.type.enum";
import { Logger } from "@libs/logger";
import {
    ActivityType, Client, Events, GuildMember,
    Message,
    PartialGuildMember
} from "discord.js";
import { RolesService } from "./services/roles.service";
import { Roles } from "@libs/enums";
import { SHA512 } from 'crypto-js';
import { DiscordMember } from "@libs/types/discord";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class BotGateway {

    constructor(
        @InjectDiscordClient() private readonly client: Client,
        private readonly messagesService: MessagesService,
        private readonly channelsService: ChannelsService,
        private readonly memberService: MembersService,
        private readonly eventEmitter: EventEmitter2,
        private readonly rolesService: RolesService,
        private readonly settings: SettingsService,
        private readonly logger: Logger,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    public async removeUnusedChannels(): Promise<void> {
        await this.channelsService.removeUnusedChannels();
        await this.channelsService.updateChannelsInfo();
    }

    @Once(Events.ClientReady)
    public async onClientReady() {

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

    @On(Events.GuildMemberRemove)
    public async onMemberLeft(discordMember: DiscordMember): Promise<void> {

    }

    @On(Events.GuildMemberAdd)
    public async onMemberJoin(discordMember: DiscordMember): Promise<void> {

        const startTime = Date.now();
        const [member, isMemberNew] = await this.memberService.saveMember(discordMember.id);
        if (!member) {
            this.logger.error(`Failed to validate user.`, { tag: LogsTypes.INTERNAL_ACTION_FAIL, startTime });
            return;
        }

        if (member.isConfirmed) {
            const isRoleAssigned = await this.rolesService.assignRoleToUser(discordMember, Roles.STUDENT);
            isRoleAssigned
                ? this.logger.log(`User role assigned successfully`, { tag: LogsTypes.PERMISSIONS_GRANTED, startTime })
                : this.logger.error(`Failed to assign role.`, { tag: LogsTypes.PERMISSIONS_FAIL, startTime });
            return;
        }

        const channel = await this.channelsService.showValidationChannelToUser(discordMember);
        if (!channel) {
            this.logger.error(`Failed to find validation channel.`,
                { tag: LogsTypes.INTERNAL_ACTION_FAIL, startTime }
            );
            return;
        }

        await this.messagesService.displayInviteMessage(channel.id);
        if (isMemberNew) {
            await this.messagesService.displayServerRules(channel.id);
            await this.messagesService.displayServerRules(channel.id);
        }

    }

    @On(Events.ChannelCreate)
    public async onChannelCreate(): Promise<void> {
        await this.channelsService.updateChannelsInfo();
    }

    @On(Events.ChannelDelete)
    public async onChannelDelete(): Promise<void> {
        await this.channelsService.updateChannelsInfo();
    }

    @On(Events.MessageCreate)
    public async handleMemberMessage(message: Message) {

        if (message.author.bot) {
            this.logger.log(`Message handling canceled. Author is bot.`);
            return;
        }

        const discordIdHash = SHA512(message.author.id).toString();
        if (!message?.channel) {
            this.logger.error(`Invalid message metadata for ${discordIdHash}.`);
            return;
        }

        try {

            const channel = await this.channelsService.findChannelById(message?.channel.id);
            if (!channel) {
                this.logger.warn(`Failed to handle message. Unknown channel.`);
                return;
            }

            const channelType = await this.channelsService.findChannelType(message.channel.id);

            const evnetName = `${channelType.toUpperCase()}_MESSAGE`
            this.eventEmitter.emitAsync(evnetName, message);

        } catch (error) {
            this.logger.error(`Failed to handle user message.`, { error });
        }
    }


}