import { InjectDiscordClient, On, Once } from "@discord-nestjs/core";
import { DiscordEvents } from "@libs/enums/discord.events.enum";
import { MessagesService } from "./services/messages.service";
import { ChannelsService } from "./services/channels.service";
import { AppEvents, BotResponse, Roles } from "@libs/enums";
import { MembersService } from "./services/members.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { RolesService } from "./services/roles.service";
import { LogsTypes } from "@libs/enums/logs.type.enum";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { DiscordMember } from "@libs/types/discord";
import { SettingsService } from "@libs/settings";
import { Injectable } from "@nestjs/common";
import { Logger } from "@libs/logger";
import {
    ActivityType, ButtonInteraction, Client, Events, Message,
} from "discord.js";
import { SHA512 } from 'crypto-js';

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
            this.logger.error(`Failed to launch application.`, {
                tag: LogsTypes.INTERNAL_ACTION_FAIL,
                error,
                startTime,
            });
        }

    }

    @On(Events.GuildMemberAdd)
    public async onMemberJoin(discordMember: DiscordMember): Promise<void> {

        const startTime = Date.now();
        const [member, isMemberNew] = await this.memberService.saveMember(discordMember.id);
        if (!member) {
            this.logger.error(`Failed to validate user.`, {
                tag: LogsTypes.INTERNAL_ACTION_FAIL,
                startTime
            });
            return;
        }

        if (this.settings.app.state.mode === `DEVELOPMENT` && !this.memberService.isAccountTesting(discordMember.id)) {
            this.logger.warn(`Real user joined to the server when bot was in development mode. Action suspended.`)
            return;
        }

        if (member.isConfirmed && member.acceptedRules) {

            const isRoleAssigned = await this.rolesService.assignRoleToUser(discordMember.id, Roles.STUDENT);
            isRoleAssigned
                ? this.logger.log(`User role assigned successfully`, {
                    tag: LogsTypes.PERMISSIONS_GRANTED,
                    startTime
                })
                : this.logger.error(`Failed to assign role.`, {
                    tag: LogsTypes.PERMISSIONS_FAIL,
                    startTime
                });
            return;
        }

        const channel = await this.channelsService.showValidationChannelToUser(discordMember);
        if (!channel) {
            this.logger.error(`Failed to find validation channel.`, {
                tag: LogsTypes.INTERNAL_ACTION_FAIL,
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
    public async onChannelCreate(): Promise<void> {
        await this.channelsService.updateChannelsInfo();
    }

    @On(Events.ChannelDelete)
    public async onChannelDelete(): Promise<void> {
        await this.channelsService.updateChannelsInfo();
    }

    @On(Events.MessageCreate)
    public async handleMemberMessage(message: Message) {

        const startTime: number = Date.now();
        if (message.author.bot) {
            this.logger.warn(`Message handling canceled. Author is bot.`, {
                tag: LogsTypes.INVALID_PAYLOAD,
                startTime,
            });
            return;
        }

        const discordIdHash = SHA512(message.author.id).toString();
        if (!message?.channel) {
            this.logger.error(`Invalid message metadata for ${discordIdHash} message.`, {
                tag: LogsTypes.INVALID_PAYLOAD,
                startTime
            });
            return;
        }

        if (this.settings.app.state.mode === `DEVELOPMENT`) {

            if (!this.memberService.isAccountTesting(message.author.id)) {
                this.logger.warn(`Message was sent by real user in development mode. Action suspended.`)
                return;
            }

            if (!this.channelsService.isChannelTesting(message.channelId)) {
                this.logger.warn(`Message was sent on real channel in development mode. Action suspended.`)
                return;
            }
        }

        try {

            const discordChannel = await this.channelsService.findDiscordChannelById(message?.channelId);
            if (!discordChannel) {
                this.logger.warn(`Failed to handle message. Unknown channel.`, {
                    tag: LogsTypes.UNKNOWN_CHANNEL,
                    startTime
                });
                return;
            }

            const channelType = await this.channelsService.findChannelType(message.channelId);
            if (!channelType) {
                this.logger.warn(`Failed to handle message. Unknown channel type.`, {
                    tag: LogsTypes.UNKNOWN_CHANNEL,
                    startTime
                });
                return;
            }

            const evnetName = `${channelType?.toUpperCase()}_MESSAGE`
            await this.eventEmitter.emitAsync(evnetName, message);
            this.logger.log(`Event ${evnetName} emitted successfully.`, {
                tag: LogsTypes.EVENT_EMITTED,
                startTime
            });

        } catch (error) {
            this.logger.error(`Failed to handle user message.`, {
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
                this.logger.warn(`Interaction happened with real user in development mode. Action suspended.`)
                return;
            }

            if (!this.channelsService.isChannelTesting(interaction.channelId)) {
                this.logger.warn(`Interaction happened on real channel in development mode. Action suspended.`)
                return;
            }
        }

        if (interaction.customId === DiscordEvents.acceptRules) {
            try {
                await this.eventEmitter.emitAsync(AppEvents.RulesAccept, interaction);
            } catch (error) {
                this.logger.error(`Failed to emit rules accept event.`, { error, startTime });
            }
            return;
        }
    }
}