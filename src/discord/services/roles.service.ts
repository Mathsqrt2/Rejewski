import { InjectDiscordClient } from "@discord-nestjs/core";
import { Roles } from "@libs/enums";
import { Logger } from "@libs/logger";
import { Injectable } from "@nestjs/common";
import { Client, Guild, Role } from "discord.js";

@Injectable()
export class RolesService {

    private discordRoles: Role[] = []

    constructor(
        @InjectDiscordClient() private readonly client: Client,
        private readonly logger: Logger,
    ) { }

    public updateRolesInfo = async () => {

        try {

            const guild: Guild = this.client.guilds.cache.get(process.env.GUILD_ID);
            if (!guild) {
                this.logger.warn(`Failed to find specified guild.`);
                return;
            }

            const roles = await guild.roles.fetch();
            this.discordRoles = Array.from(roles.values());

            return this.discordRoles;

        } catch (error) {
            this.logger.error(`Failed to update roles info.`);
        }
    }

    public assignRoleToUser = async (memberId: string, role: Roles): Promise<boolean> => {
        return true;
    }

}