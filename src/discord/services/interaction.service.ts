import { Channel } from "@libs/database/entities/channel.entity";
import { Member } from "@libs/database/entities/member.entity";
import { InjectDiscordClient } from "@discord-nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";
import { ButtonInteraction, Client } from "discord.js";
import { OnEvent } from "@nestjs/event-emitter";
import { AppEvents, BotResponse, LogsTypes, Roles } from "@libs/enums";
import { SHA512 } from 'crypto-js';
import { RolesService } from "./roles.service";
import { MessagesService } from "./messages.service";
import { Content } from "src/app.content";

@Injectable()
export class InteractionService {

    constructor(
        @InjectRepository(Channel) private readonly channel: Repository<Channel>,
        @InjectRepository(Member) private readonly member: Repository<Member>,
        @InjectDiscordClient() private readonly client: Client,
        private readonly messagesService: MessagesService,
        private readonly rolesService: RolesService,
        private readonly logger: Logger,
    ) { }

    @OnEvent(AppEvents.RulesAccept)
    private async onRulesAccepted(interaction: ButtonInteraction): Promise<void> {

        const startTime: number = Date.now();
        try {

            const discordIdHash = SHA512(interaction.user.id).toString();
            const member = await this.member.findOne({ where: { discordIdHash } });
            if (!member) {
                this.logger.warn(`Member doesn't exist`);
                return;
            }

            if (member.acceptedRules) {
                await interaction.deferUpdate();
                return;
            }

            await this.member.save({ ...member, acceptedRules: true });
            if (member.isConfirmed) {

                const isRoleAssigned = await this.rolesService.assignRoleToUser(interaction.user.id, Roles.STUDENT);
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

            await interaction.reply({
                content: Content.messages.confirmRulesAcceptance(),
                ephemeral: false,
            })

            await this.messagesService.sendMessage(interaction.channelId, BotResponse.askAboutEmail);

        } catch (error) {
            this.logger.error(`Failed to handle interaction.`, { startTime, error });
        }

    }

}