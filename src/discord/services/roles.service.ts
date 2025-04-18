import { InjectDiscordClient } from "@discord-nestjs/core";
import { LocalRole } from "@libs/database/entities/role.entity";
import { Roles } from "@libs/enums";
import { Logger } from "@libs/logger";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Client, Guild, PermissionFlagsBits, Role } from "discord.js";
import { Repository } from "typeorm";

@Injectable()
export class RolesService {

    private discordRoles: Role[] = []

    constructor(
        @InjectDiscordClient() private readonly client: Client,
        @InjectRepository(LocalRole) private readonly localRole: Repository<LocalRole>,
        private readonly logger: Logger,
    ) { }

    public updateRoleDetails = async (newRole: Role) => {

        const startTime: number = Date.now();
        try {
            const localRole = await this.localRole.findOne({ where: { discordRoleId: newRole.id } });

            await this.localRole.save({
                ...localRole,
                name: newRole.name,
                isAdmin: newRole.permissions.has(PermissionFlagsBits.Administrator),
                isDeleted: false,
                isVerified:
                    newRole.id === process.env.VERIFIED_ROLE_ID
                    || newRole.id === process.env.MEMBER_ROLE_ID
                    || newRole.permissions.has(PermissionFlagsBits.Administrator),
                isMember:
                    newRole.id === process.env.MEMBER_ROLE_ID
                    || newRole.permissions.has(PermissionFlagsBits.Administrator),
                updatedAt: Date.now(),
            });

        } catch (error) {
            this.logger.error(`Failed to update ${newRole.name} params.`, { startTime });
        }

    }

    public updateRolesInfo = async () => {

        const startTime: number = Date.now();
        try {

            const guild: Guild = this.client.guilds.cache.get(process.env.GUILD_ID);
            if (!guild) {
                this.logger.warn(`Failed to find specified guild.`);
                return;
            }

            const roles = await guild.roles.fetch();
            this.discordRoles = Array.from(roles.values());

            const existingRoles = await this.localRole.find();

            Promise.all(roles
                .filter(role => !existingRoles.some(existingRoles => (
                    existingRoles.discordRoleId === role.id
                )))
                .map(role => this.localRole.save({
                    discordRoleId: role.id,
                    name: role.name,
                    isAdmin: role.permissions.has(PermissionFlagsBits.Administrator),
                    isDeleted: false,
                    isVerified:
                        role.id === process.env.VERIFIED_ROLE_ID
                        || role.id === process.env.MEMBER_ROLE_ID
                        || role.permissions.has(PermissionFlagsBits.Administrator),
                    isMember:
                        role.id === process.env.MEMBER_ROLE_ID
                        || role.permissions.has(PermissionFlagsBits.Administrator),
                })));

            const removedRoles = existingRoles.filter(existingRole => (
                !roles.some(role => role.id === existingRole.discordRoleId)
            ));

            Promise.all(removedRoles.map(removedRole => this.localRole.save({
                ...removedRole,
                isDeleted: true,
            })))

            this.logger.log(`Roles refreshed successfully.`, { startTime });
            return this.discordRoles;

        } catch (error) {
            this.logger.error(`Failed to update roles info.`);
        }
    }

    public assignRoleToUser = async (memberId: string, role: Roles): Promise<boolean> => {

        let roleId: string = null;
        switch (role) {
            case Roles.MEMBER: roleId = process.env.MEMBER_ROLE_ID;
                break;
            case Roles.VERIFIED: roleId = process.env.VERIFIED_ROLE_ID
                break;
        }

        if (!roleId) {
            this.logger.warn(`Action suspended. Unhandled role type.`);
            return;
        }

        try {
            const guild = this.client.guilds.cache.get(process.env.GUILD_ID);
            if (!guild) {
                throw new Error('Guild not found');
            }

            const member = await guild.members.fetch(memberId);
            await member.roles.add(roleId)
            return true;
        } catch (error) {
            this.logger.error(`Failed to assign role ${role} to user.`, { error });
            return false;
        }
    }
}