import { AppEvents, BotResponse, LogsTypes, Roles } from "@libs/enums";
import { ButtonInteraction, MessageFlags } from "discord.js";
import { Member } from "@libs/database/entities/member.entity";
import { MessagesService } from "./messages.service";
import { InjectRepository } from "@nestjs/typeorm";
import { OnEvent } from "@nestjs/event-emitter";
import { RolesService } from "./roles.service";
import { Injectable } from "@nestjs/common";
import { Content } from "src/app.content";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";
import { SHA512 } from 'crypto-js';

@Injectable()
export class InteractionService {

    constructor(
        @InjectRepository(Member) private readonly member: Repository<Member>,
        private readonly messagesService: MessagesService,
        private readonly rolesService: RolesService,
        private readonly logger: Logger,
    ) { }

    @OnEvent(AppEvents.RulesAccept)
    private async onRulesAccepted(interaction: ButtonInteraction): Promise<void> {

        const startTime: number = Date.now();
        try {

            const discordIdHash = SHA512(interaction.user.id).toString();
            const member = await this.member.findOne({
                where: { discordIdHash },
                relations: [`channels`],
            });

            if (!member) {
                this.logger.warn(`Member doesn't exist`);
                await interaction.deferUpdate();
                return;
            }

            if (!member.channels.some(channel => channel.discordId === interaction.channelId)) {
                this.logger.warn(`Action suspended. Interaction member is not channel owner.`)
                await interaction.deferUpdate();
                return;
            }

            if (member.acceptedRules) {
                await interaction.deferUpdate();
                return;
            }

            await this.member.save({ ...member, acceptedRules: true });
            if (member.isConfirmed) {

                const isRoleAssigned = await this.rolesService.assignRoleToMember(interaction.user.id, Roles.VERIFIED);
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
                flags: [MessageFlags.Ephemeral],
            })

            await this.messagesService.sendMessage(interaction.channelId, BotResponse.askAboutEmail);

        } catch (error) {

            this.logger.error(`Failed to handle interaction.`, { startTime, error });
            await interaction.deferUpdate();

        }

    }

}