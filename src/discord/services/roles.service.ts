import { Injectable } from "@nestjs/common";
import { GuildMember, PartialGuildMember } from "discord.js";

@Injectable()
export class RolesService {

    constructor() { }

    public assignRoleToUser = (discordMember: GuildMember | PartialGuildMember,) => { }

}