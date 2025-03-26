import {
    ActionRowBuilder, ButtonBuilder,
    ButtonInteraction, ButtonStyle, Client, Message,
    SendableChannels
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

        const doesMessageContainMaliciousLinkResult = this.contentService.detectMaliciousLinks(message);
        if (doesMessageContainMaliciousLinkResult) {
            //todo, remove message, warn user, notify admin; 
        }

        const doesMessageContainProfanityResult = this.contentService.detectProfanity(message);
        if (doesMessageContainMaliciousLinkResult) {
            // todo, remove message, warn user, notify admin
        }

    }

    @OnEvent(AppEvents.AdministrationMessage, { async: true })
    private async handleAdministrationChannelMessage(message: Message): Promise<void> {

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
            const oneDayAgo = new Date();
            oneDayAgo.setHours(oneDayAgo.getHours() - 1);

            const [requests, requestsCountFromLastHour] = await this.request.findAndCount({
                where: {
                    memberId: channel.assignedMember.id,
                    createdAt: MoreThanOrEqual(oneDayAgo),
                },
                order: { id: `DESC` },
                take: maxAttemptsNumberPerHous,
            });

            if (requestsCountFromLastHour > maxAttemptsNumberPerHous) {
                const latestAttempt = requests.at(-1);
                const unlockTime: Date = new Date(latestAttempt.createdAt.setHours(latestAttempt.createdAt.getHours() + 1));

                message.reply({ content: `Spróbowałeś podać kod zbyt wiele razy. Możesz spróbować ponownie po ${unlockTime.toLocaleString(`pl-PL`)}` });
                return
            }

            if (channel.assignedMember.isConfirmed) {
                const isRoleAssigned = await this.rolesService.assignRoleToUser(message.author.id, Roles.STUDENT);
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

            const lastMemberRequest = await this.request.findOne({
                where: { memberId: channel.assignedMember.id },
                order: { id: `DESC` },
            });

            const threeDaysAgo: Date = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

            if (!lastMemberRequest || lastMemberRequest.createdAt < threeDaysAgo) {

                const [messageEmail, error]: [string, WrongEmail] = this.contentService.detectEmail(message.content);
                if (error) {
                    let content: string = null;
                    switch (error) {
                        case WrongEmail.emailInUse: content = `emailInUse`; break;
                        case WrongEmail.incorrectEmail: content = `incorrectEmail`; break;
                        case WrongEmail.missingEmail: content = `missingEmail`; break;
                        case WrongEmail.tooManyEmails: content = `toomanyEmails`; break;
                        case WrongEmail.wrongDomain: content = `wrongdomain`; break;
                    }
                    message.reply({ content });
                    return;
                }

                const emailHash: string = SHA512(messageEmail).toString();
                let newEmail = await this.email.findOne({ where: { emailHash } });

                if (!newEmail) {
                    newEmail = await this.email.save({ emailHash });
                }

                let request = await this.request.findOne({
                    where: {
                        memberId: channel.assignedMember.id,
                        emailId: newEmail.id
                    },
                    relations: [`code`],
                })

                if (request && request.code.expireDate >= new Date()) {
                    this.emailer.sendVerificationEmailTo(messageEmail, request.code.code);
                    message.reply(`Twój poprzedni kod jest wciąż aktualny, wysłałem go ponownie na Twojego maila. Jeżeli go nie widzisz, sprawdź w spamie.`);
                    return;
                }

                request = await this.request.save({
                    memberId: channel.assignedMember.id,
                    emailId: newEmail.id,
                });

                const code = await this.verification.generateCode(request, newEmail);
                this.emailer.sendVerificationEmailTo(messageEmail, code.code);

                message.reply({ content: `Właśnie wysłałem wiadomość z kodem na Twój email: "${messageEmail}", podaj mi go aby uzyskać dostęp do serwera.` });
                return;
            }

            const [messageCode, error]: [string, WrongCode] = await this.contentService.detectCode(message);

            await this.request.save({
                memberId: channel.assignedMember.id,
                emailId: lastMemberRequest.emailId,
            })

            if (error) {
                let content: string = null;
                switch (error) {
                    case WrongCode.emailInsteadCode: `emailInsteadCode`; break;
                    case WrongCode.incorrectCode: `incorrectCode`; break;
                    case WrongCode.missingCode: `missingCode`; break;
                    case WrongCode.wrongCodeFormat: `wrongCodeFormat`; break;
                }
                message.reply({ content });
                return;
            }

            const member: Member = await this.member.findOne({
                where: { id: channel.assignedMember.id },
                relations: [`requests`, `requests.code`]
            })

            this.logger.debug(member);

            const code = member.requests.find(request => request.code?.createdAt > threeDaysAgo);
            if (!code) {
                message.reply({ content: `ostatni kod już wygasł, podaj ponownie maila, a wyślę Ci nowy` });
                return;
            }

            const lastCode: Code = code.code;
            if (lastCode.code === messageCode) {

                await this.rolesService.assignRoleToUser(message.author.id, Roles.STUDENT);
                await this.channelsService.removeDiscordChannel(message.channelId);

            } else {
                message.reply({ content: `Podany kod jest nieprawidłowy, spróbuj ponownie:` })
            }

        } catch (error) {
            this.logger.error(`Failed to handle private channel message.`, { error, startTime });
        }

    }

    @OnEvent(AppEvents.PersonalMessage, { async: true })
    private async handlePersonalChannelMessage(message: Message): Promise<void> {


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