import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { Description } from "@libs/database/entities/description.entity";
import { InjectDiscordClient, On, Once } from "@discord-nestjs/core";
import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { DiscordEvents } from "@libs/enums/discord.events.enum";
import { MessagesService } from "./services/messages.service";
import { ChannelsService } from "./services/channels.service";
import { AppEvents, BotResponse, Roles } from "@libs/enums";
import { MembersService } from "./services/members.service";
import { RolesService } from "./services/roles.service";
import { LogsTypes } from "@libs/enums/logs.type.enum";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { DiscordMember } from "@libs/types/discord";
import { InjectRepository } from "@nestjs/typeorm";
import { SettingsService } from "@libs/settings";
import {
    ActivityType, ButtonInteraction, Client,
    Events, Message,
    Role,
} from "discord.js";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";
import { SHA512 } from 'crypto-js';
import { Content } from "src/app.content";
import { CronJobs } from "@libs/enums/cron.enum";

@Injectable()
export class BotGateway implements OnApplicationBootstrap {

    private botStatuses: string[] = [];
    private lastStatusUsed: number = 0;

    constructor(
        @InjectDiscordClient() private readonly client: Client,
        @InjectRepository(Description) private readonly description: Repository<Description>,
        private readonly messagesService: MessagesService,
        private readonly channelsService: ChannelsService,
        private readonly memberService: MembersService,
        private readonly eventEmitter: EventEmitter2,
        private readonly rolesService: RolesService,
        private readonly settings: SettingsService,
        private readonly cron: SchedulerRegistry,
        private readonly logger: Logger,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    public removeUnusedChannels(): void {
        this.channelsService.removeUnusedChannels();
        this.channelsService.updateChannelsInfo();
        this.memberService.updateMembersInfo();
        this.rolesService.updateRolesInfo();
    }

    @Cron(CronExpression.EVERY_5_MINUTES, { name: CronJobs.CHANGE_CURRENT_BOT_ACTIVITY, disabled: true })
    public changeCurrentBotActivity(): void {

        const index = (this.lastStatusUsed++ % this.botStatuses.length);
        const currentStatus = this.botStatuses[index];
        this.client.user.setActivity({
            name: currentStatus,
            type: ActivityType.Custom,
        })

    }

    @Once(Events.ClientReady)
    public async onClientReady(): Promise<void> {

        const startTime: number = Date.now();
        const descriptions = await this.description.find();
        if (descriptions) {
            this.botStatuses = descriptions.map(description => description.value);
        }

        const initialStatus = this.botStatuses.at(0) || Content.defaults.status();

        this.client.user.setActivity({
            name: initialStatus,
            type: ActivityType.Custom,
        })

        const cronJob = this.cron.getCronJob(CronJobs.CHANGE_CURRENT_BOT_ACTIVITY);
        if (this.botStatuses.length > 1) {
            cronJob.start();
            this.logger.log(Content.log.cronStarted(`Activity change`),
                { startTime, tag: LogsTypes.INTERNAL_ACTION }
            );
        }

        try {

            this.logger.log(Content.log.appLaunched(this.settings.app.name, this.client.application.id), {
                tag: LogsTypes.INTERNAL_ACTION,
                startTime,
            })

        } catch (error) {
            this.logger.error(Content.error.failedToLaunchApplication(), {
                tag: LogsTypes.INTERNAL_ACTION_FAIL,
                error,
                startTime,
            });
        }

    }

    @On(Events.GuildRoleCreate)
    public onGuildRoleCreate(): void {
        this.rolesService.updateRolesInfo();
    }

    @On(Events.GuildRoleUpdate)
    public async onGuildRoleUpdate(_: Role, newRole: Role): Promise<void> {
        await this.rolesService.updateRoleDetails(newRole)
        this.rolesService.updateRolesInfo();
    }

    @On(Events.GuildRoleDelete)
    public onGuildRoleDelete(): void {
        this.rolesService.updateRolesInfo();
    }

    @On(Events.GuildMemberAdd)
    public async onMemberJoin(discordMember: DiscordMember): Promise<void> {

        const startTime: number = Date.now();
        const [member, isMemberNew] = await this.memberService.saveMember(discordMember.id);
        if (!member) {
            this.logger.error(Content.error.failedToValidateMember(), {
                tag: LogsTypes.INTERNAL_ACTION_FAIL,
                startTime
            });
            return;
        }

        if (this.settings.app.state.mode === `DEVELOPMENT` && !this.memberService.isAccountTesting(discordMember.id)) {
            this.logger.warn(Content.warn.actionSuspended(`realUserMessageInDevMode`),
                { startTime, tag: LogsTypes.PERMISSIONS_DENIED })
            return;
        }

        if (member.isConfirmed && member.acceptedRules) {

            await this.rolesService.assignRoleToMember(discordMember.id, Roles.VERIFIED);
            return;
        }

        const channel = await this.channelsService.showValidationChannelToUser(discordMember);
        if (!channel) {
            this.logger.error(Content.error.failedToFindChannel(`validation`), {
                tag: LogsTypes.UNKNOWN_CHANNEL,
                startTime
            }
            );
            return;
        }

        if (isMemberNew) {
            await this.messagesService.sendMessage(channel.id, BotResponse.welcomeNewMember);
        } else {
            await this.messagesService.sendMessage(channel.id, BotResponse.welcomeReturningMember);
        }

        if (!member.acceptedRules) {
            await this.messagesService.sendMessage(channel.id, BotResponse.sendServerRules);
            await this.messagesService.sendRulesButton(channel.id);
        } else {
            await this.messagesService.sendMessage(channel.id, BotResponse.askAboutEmail);
        }

        await this.channelsService.updateChannelsInfo();
    }

    @On(Events.ChannelCreate)
    public onChannelCreate(): void {
        this.channelsService.updateChannelsInfo();
    }

    @On(Events.ChannelDelete)
    public onChannelDelete(): void {
        this.channelsService.updateChannelsInfo();
    }

    @On(Events.ChannelUpdate)
    public onChannelUpdate(): void {
        this.channelsService.updateChannelsInfo();
    }

    @On(Events.MessageCreate)
    public async handleMemberMessage(message: Message): Promise<void> {

        const startTime: number = Date.now();
        if (message.author.bot) {
            this.logger.warn(Content.warn.messageAuthorIsBot(), {
                tag: LogsTypes.INVALID_PAYLOAD,
                startTime
            });
            return;
        }

        const discordIdHash = SHA512(message.author.id).toString();
        if (!message?.channel) {
            this.logger.error(Content.error.invalidMetadata(discordIdHash), {
                tag: LogsTypes.UNKNOWN_MEMBER,
                startTime
            });
            return;
        }

        if (this.settings.app.state.mode === `DEVELOPMENT`) {

            if (!this.memberService.isAccountTesting(message.author.id)) {
                this.logger.warn(Content.warn.actionSuspended(`realUserMessageInDevMode`),
                    { startTime, tag: LogsTypes.PERMISSIONS_DENIED })
                return;
            }

            if (!this.channelsService.isChannelTesting(message.channelId)) {
                this.logger.warn(Content.warn.actionSuspended(`messageOnRealChannelInDevMode`),
                    { startTime, tag: LogsTypes.PERMISSIONS_DENIED })
                return;
            }
        }

        try {

            const discordChannel = await this.channelsService.findDiscordChannelById(message?.channelId);
            if (!discordChannel) {
                this.logger.warn(Content.error.failedToHandleMessage(`Unknown channel`), {
                    tag: LogsTypes.UNKNOWN_CHANNEL,
                    startTime
                });
                return;
            }

            const channelType = await this.channelsService.findChannelType(message.channelId);
            if (!channelType) {
                this.logger.warn(Content.error.failedToHandleMessage(`Unknown channel type`), {
                    tag: LogsTypes.UNKNOWN_CHANNEL,
                    startTime
                });
                return;
            }

            const evnetName = `${channelType?.toUpperCase()}_MESSAGE`
            await this.eventEmitter.emitAsync(evnetName, message);
            this.logger.log(Content.log.eventEmitted(evnetName), {
                tag: LogsTypes.EVENT_EMITTED,
                startTime
            });

        } catch (error) {
            this.logger.error(Content.error.failedToHandleMessage(), {
                tag: LogsTypes.INTERNAL_ACTION_FAIL,
                error,
                startTime
            });
        }
    }

    @On(Events.InteractionCreate)
    async onButtonClick(interaction: ButtonInteraction): Promise<void> {

        const startTime: number = Date.now();
        if (!interaction.isButton()) {
            return;
        }

        if (this.settings.app.state.mode === `DEVELOPMENT`) {

            if (!this.memberService.isAccountTesting(interaction.user.id)) {
                this.logger.warn(Content.warn.actionSuspended(`realUserInteractionInDevMode`),
                    { startTime, tag: LogsTypes.PERMISSIONS_DENIED })
                return;
            }

            if (!this.channelsService.isChannelTesting(interaction.channelId)) {
                this.logger.warn(Content.warn.actionSuspended(`realChannelInteractionInDevMode`),
                    { startTime, tag: LogsTypes.PERMISSIONS_DENIED })
                return;
            }
        }

        if (interaction.customId === DiscordEvents.acceptRules) {
            try {
                await this.eventEmitter.emitAsync(AppEvents.RulesAccept, interaction);
            } catch (error) {
                this.logger.error(Content.error.failedToEmitEvent(),
                    { error, startTime, tag: LogsTypes.INTERNAL_ACTION_FAIL });
            }
            return;
        }
    }

    public onApplicationBootstrap() {
        this.channelsService.updateChannelsInfo();
        this.rolesService.updateRolesInfo();
        this.memberService.updateMembersInfo();
    }
}