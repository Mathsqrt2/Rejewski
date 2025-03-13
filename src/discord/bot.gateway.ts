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
import { BotResponse, Roles } from "@libs/enums";
import { SHA512 } from 'crypto-js';
import { DiscordMember } from "@libs/types/discord";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Content } from "src/app.content";

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

        if (member.isConfirmed) {
            const isRoleAssigned = await this.rolesService.assignRoleToUser(discordMember, Roles.STUDENT);
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
        await this.messagesService.sendMessage(channel.id, BotResponse.sendServerRules);
        await this.messagesService.sendMessage(channel.id, BotResponse.askAboutEmail);
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
            this.logger.error(`Invalid message metadata for ${discordIdHash}.`, {
                tag: LogsTypes.INVALID_PAYLOAD,
                startTime
            });
            return;
        }

        try {

            const channel = await this.channelsService.findChannelById(message?.channel.id);
            if (!channel) {
                this.logger.warn(`Failed to handle message. Unknown channel.`, {
                    tag: LogsTypes.UNKNOWN_CHANNEL,
                    startTime
                });
                return;
            }

            const channelType = await this.channelsService.findChannelType(message.channel.id);
            if (!channelType) {
                this.logger.warn(`Failed to handle message. Unknown channel type.`, {
                    tag: LogsTypes.UNKNOWN_CHANNEL,
                    startTime
                });
                return;
            }

            const evnetName = `${channelType.toUpperCase()}_MESSAGE`
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


}