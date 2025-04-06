import { InjectDiscordClient } from "@discord-nestjs/core";
import { Roles } from "@libs/enums";
import { Logger } from "@libs/logger";
import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { Client, Guild, GuildMember, PartialGuildMember } from "discord.js";

@Injectable()
export class RolesService implements OnApplicationBootstrap {

    private discordRoles = []

    constructor(
        @InjectDiscordClient() private readonly client: Client,
        private readonly logger: Logger,
    ) { }

    public async onApplicationBootstrap() {
    }

    private updateRolesData = async () => {

        const guild: Guild = this.client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            this.logger.warn(`Failed to find specified guild.`);
            return;
        }

        const roles = await guild.roles.fetch();
        this.discordRoles = Array.from(roles.values());

        this.logger.debug(this.discordRoles.map(r => r.name));

        return this.discordRoles;
    }

    public assignRoleToUser = async (memberId: string, role: Roles): Promise<boolean> => {
        return true;
    }

}