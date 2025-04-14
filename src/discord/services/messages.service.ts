import {
    ActionRowBuilder, ButtonBuilder, SendableChannels,
    ButtonInteraction, ButtonStyle, Client, Message,
    MessageFlags,
} from "discord.js";
import { InjectDiscordClient } from "@discord-nestjs/core";
import { Channel } from "@libs/database/entities/channel.entity";
import { Request } from "@libs/database/entities/request.entity";
import { DiscordEvents } from "@libs/enums/discord.events.enum";
import { Member } from "@libs/database/entities/member.entity";
import { Email } from "@libs/database/entities/email.entity";
import { Code } from "@libs/database/entities/code.entity";
import { BotResponse } from "@libs/enums/responses.enum";
import { WrongEmail } from "@libs/enums/wrongEmail.enum";
import { VerificationService } from "@libs/verification";
import { WrongCode } from "@libs/enums/wrongCode.enum";
import { MoreThanOrEqual, Repository } from "typeorm";
import { ChannelsService } from "./channels.service";
import { AppEvents } from "@libs/enums/events.enum";
import { InjectRepository } from "@nestjs/typeorm";
import { ContentService } from "./content.service";
import { OnEvent } from "@nestjs/event-emitter";
import { LogsTypes, Roles } from "@libs/enums";
import { EmailerService } from "@libs/emailer";
import { RolesService } from "./roles.service";
import { Injectable } from "@nestjs/common";
import { Content } from "src/app.content";
import { Logger } from "@libs/logger";
import { SHA512 } from "crypto-js";

@Injectable()
export class MessagesService {

    constructor(
        @InjectRepository(Channel) private readonly channel: Repository<Channel>,
        @InjectRepository(Request) private readonly request: Repository<Request>,
        @InjectRepository(Member) private readonly member: Repository<Member>,
        @InjectRepository(Email) private readonly email: Repository<Email>,
        @InjectRepository(Code) private readonly code: Repository<Code>,
        @InjectDiscordClient() private readonly client: Client,
        private readonly verification: VerificationService,
        private readonly channelsService: ChannelsService,
        private readonly contentService: ContentService,
        private readonly rolesService: RolesService,
        private readonly emailer: EmailerService,
        private readonly logger: Logger,
    ) { }

    @OnEvent(AppEvents.PublicMessage, { async: true })
    private async handlePublicChannelMessage(message: Message): Promise<void> {

        let response: string = Content.messages.informAboutMessageRemoval();
        const [doesMessageContainMaliciousLink]: [boolean, string[]] = this.contentService.detectMaliciousLinks(message);
        if (doesMessageContainMaliciousLink) {
            response += Content.messages.informAboutMaliciousLinks();
        }

        const [doesMessageContainProfanity]: [boolean, string[]] = this.contentService.detectProfanity(message);
        if (doesMessageContainProfanity) {
            response += Content.messages.informAboutProfanity();
        }

        response += Content.messages.followRulesReminder();
        if (!doesMessageContainMaliciousLink && !doesMessageContainProfanity) {
            return;
        }

        await message.reply({
            content: response,
            flags: [MessageFlags.SuppressNotifications],
        });
        await message.delete();

    }

    private respondToWrongEmail = async (message: Message, error: WrongEmail): Promise<void> => {
        let content: string = null;
        switch (error) {
            case WrongEmail.emailInUse: content = `emailInUse`; break;
            case WrongEmail.incorrectEmail: content = `incorrectEmail`; break;
            case WrongEmail.missingEmail: content = `missingEmail`; break;
            case WrongEmail.tooManyEmails: content = `toomanyEmails`; break;
            case WrongEmail.wrongDomain: content = `wrongdomain`; break;
        }
        await message.reply({ content });
    }

    @OnEvent(AppEvents.PrivateMessage, { async: true })
    private async handlePrivateChannelMessage(message: Message): Promise<void> {

        const startTime = Date.now();
        try {

            const channel: Channel = await this.channel.findOne({
                where: { discordId: message.channelId },
                relations: ['assignedMember']
            });

            if (!channel) {
                this.logger.error(`Invalid channel.`, { startTime });
                return;
            }

            if (!channel.assignedMember) {
                this.logger.warn(`Action suspended, private channel has no assigned members.`, { startTime });
                return;
            }

            const discordMemberIdHash = SHA512(message.author.id).toString();
            if (channel.assignedMember.discordIdHash !== discordMemberIdHash) {
                this.logger.warn(`Action suspended. Someone else is using client channel.`, { startTime });
                return;
            }

            if (!channel.assignedMember.acceptedRules) {
                message.reply({ content: `Aby odblokować zawartość serwera, musisz najpierw zaakceptować regulamin.` });
                return;
            }

            const maxAttemptsNumberPerHous: number = 3;
            const oneHourAgo = new Date();
            oneHourAgo.setHours(oneHourAgo.getHours() - 1);

            const [requests, requestsCountFromLastHour] = await this.request.findAndCount({
                where: {
                    memberId: channel.assignedMember.id,
                    createdAt: MoreThanOrEqual(oneHourAgo),
                },
                order: { id: `DESC` },
                take: maxAttemptsNumberPerHous,
            });

            if (requestsCountFromLastHour >= maxAttemptsNumberPerHous) {
                const latestAttempt = requests.at(-1);
                const unlockTime: Date = new Date(latestAttempt.createdAt.setHours(latestAttempt.createdAt.getHours() + 1));

                message.reply({ content: `Spróbowałeś podać kod zbyt wiele razy. Możesz spróbować ponownie po ${unlockTime.toLocaleString(`pl-PL`)}` });
                return
            }

            if (channel.assignedMember.isConfirmed) {
                const isRoleAssigned = await this.rolesService.assignRoleToUser(message.author.id, Roles.STUDENT);
                if (isRoleAssigned) {
                    await this.channelsService.removeDiscordChannel(message.channelId);
                    this.logger.log(`User role assigned successfully`, {
                        tag: LogsTypes.PERMISSIONS_GRANTED,
                        startTime
                    })
                } else {
                    this.logger.error(`Failed to assign role.`, {
                        tag: LogsTypes.PERMISSIONS_FAIL,
                        startTime
                    });
                }
                return;
            }

            const threeDaysAgo: Date = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            const requestsFromLastThreeDays = await this.request.find({
                where: {
                    memberId: channel.assignedMember.id,
                    createdAt: MoreThanOrEqual(threeDaysAgo),
                },
                order: { id: `DESC` },
            })

            if (!requestsFromLastThreeDays.length || !requestsFromLastThreeDays.some(request => request.emailId)) {

                const [messageEmail, error]: [string, WrongEmail] = this.contentService.detectEmail(message.content);
                if (error) {
                    await this.respondToWrongEmail(message, error);
                    return;
                }

                const emailHash: string = SHA512(messageEmail).toString();
                let newEmail = await this.email.findOne({ where: { emailHash }, relations: [`assignedMember`] });
                if (!newEmail) {
                    newEmail = await this.email.save({ emailHash });
                }

                const request = await this.request.save({
                    memberId: channel.assignedMember.id,
                    emailId: newEmail.id,
                });

                const code = await this.verification.generateCode(request, newEmail);
                await this.emailer.sendVerificationEmailTo(messageEmail, code.value);

                message.reply({ content: `Właśnie wysłałem wiadomość z kodem na Twój email: "${messageEmail}", podaj mi go aby uzyskać dostęp do serwera.` });
                return;
            }

            const lastRequestWithEmail: Request = requestsFromLastThreeDays.find(request => request.emailId);
            if (lastRequestWithEmail && lastRequestWithEmail.code?.expireDate >= new Date()) {

                const [messageEmail, error]: [string, WrongEmail] = this.contentService.detectEmail(message.content);
                if (error) {
                    await this.respondToWrongEmail(message, error);
                    return;
                }



                const content: string = `Twój poprzedni kod jest wciąż aktualny, wysłałem go ponownie na Twojego maila. Jeżeli go nie widzisz, sprawdź w spamie.`
                this.emailer.sendVerificationEmailTo(content, lastRequestWithEmail.code.value);
                message.reply(content);
                return;

            }

            const [messageCode, error]: [string, WrongCode] = await this.contentService.detectCode(message);
            await this.request.save({
                memberId: channel.assignedMember.id,
                emailId: lastRequestWithEmail.emailId,
            })

            if (error) {
                let content: string = null;
                switch (error) {
                    case WrongCode.emailInsteadCode: content = `emailInsteadCode`;
                        break;
                    case WrongCode.incorrectCode: content = `incorrectCode`;
                        break;
                    case WrongCode.missingCode:
                        content = `missingCode`;

                        break;
                    case WrongCode.wrongCodeFormat:
                        content = `wrongCodeFormat`;
                        break;
                }
                message.reply({ content });
                return;
            }

            const member: Member = await this.member.findOne({
                where: { id: channel.assignedMember.id },
                relations: [`requests`, `requests.code`, `requests.assignedEmail`],
            })

            const request = member.requests.find(request => request.code?.createdAt > threeDaysAgo);
            if (!request.code) {
                message.reply({ content: `Twój ostatni kod już wygasł, podaj ponownie maila, a wyślę Ci nowy` });
                return;
            }

            if (request.code.value === messageCode) {

                await this.rolesService.assignRoleToUser(message.author.id, Roles.STUDENT);
                await this.channelsService.removeDiscordChannel(message.channelId);
                await this.email.save({
                    ...request.assignedEmail,
                    isConfirmed: true,
                    memberId: member.id,
                })
                await this.member.save({
                    ...member,
                    isConfirmed: true,
                    emailId: 1
                })

            } else {
                message.reply({ content: `Podany kod jest nieprawidłowy, spróbuj ponownie:` });
            }

        } catch (error) {
            this.logger.error(`Failed to handle private channel message.`, { error, startTime });
        }

    }

    private getSendableChannel = (textChannelId: string): SendableChannels => {

        const channel = this.client.channels.cache.get(textChannelId);
        if (!channel) {
            this.logger.error(`Failed to find specified channel.`);
            throw new Error(`Failed to find specified channel.`);
        }

        if (!channel.isSendable()) {
            this.logger.error(`Specified channel is not sendable.`);
            throw new Error(`Specified channel is not sendable.`);
        }

        return channel;
    }

    private findMessageContent = (type: BotResponse, param?: unknown): string => {
        switch (type) {
            case BotResponse.welcomeNewMember: return Content.messages.welcomeNewMember();
            case BotResponse.welcomeReturningMember: return Content.messages.welcomeReturningMember();
            case BotResponse.askAboutEmail: return Content.messages.askAboutEmail();
            case BotResponse.retryToAskAboutEmail: return Content.messages.retryToAskAboutEmail();
            case BotResponse.respondToStrangeEmailFormat: return Content.messages.respondToStrangeEmailFormat();
            case BotResponse.respondToWrongMessage: return Content.messages.respondToWrongMessage();
            case BotResponse.askAboutCode: return Content.messages.askAboutCode(param?.toString() || null);
            case BotResponse.informAboutWrongCode: return Content.messages.informAboutWrongCode(param?.toString() || null);
            case BotResponse.retryToAskAboutCode: return Content.messages.retryToAskAboutCode();
            case BotResponse.sendServerRules: return Content.messages.sendServerRules();
        }
    }

    public sendMessage = async (channelId: string, type: BotResponse, param?: unknown): Promise<void> => {

        const startTime: number = Date.now();
        try {
            const channel = this.getSendableChannel(channelId);
            const message: string = this.findMessageContent(type, param || null);

            if (!message) {
                throw new Error(`Message from template: "${type}" is empty.`)
            }

            await channel.send(message);
            this.logger.log(`Message sent successfully.`, { startTime });
        } catch (error) {
            this.logger.error(Content.error.failedToDisplayInviteMessage(), { error, startTime })
        }
    }

    public sendRulesButton = async (channelId: string): Promise<void> => {

        const startTime: number = Date.now();
        try {

            const channel = this.getSendableChannel(channelId);
            const button = new ButtonBuilder()
                .setCustomId(DiscordEvents.acceptRules)
                .setLabel(Content.interface.rulesAcceptButton())
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
            await channel.send({
                content: Content.messages.askAboutAcceptanceOfRules(),
                components: [row],
            })

        } catch (error) {
            this.logger.error(`Failed to send rules button.`, { error, startTime });
        }

    }

    public disableRulesButton = async (interaction: ButtonInteraction): Promise<void> => {

        const startTime: number = Date.now();
        const originalMessage = await interaction.channel?.messages.fetch(interaction.message.id);
        if (!originalMessage) {
            this.logger.warn(`Original message doesn't exist`, { startTime });
            return;
        }

        const button = new ButtonBuilder()
            .setCustomId(DiscordEvents.cancelRulesAcceptance)
            .setLabel(Content.interface.cancelRulesAcceptance())
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
        await originalMessage.edit({
            content: interaction.message?.content,
            components: [row],
        })
    }

}