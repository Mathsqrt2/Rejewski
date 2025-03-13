import { Roles } from "@libs/enums";
import { Injectable } from "@nestjs/common";
import { GuildMember, PartialGuildMember } from "discord.js";

@Injectable()
export class RolesService {

    constructor() { }

    public assignRoleToUser = async (memberId: string, role: Roles): Promise<boolean> => {
        return true;
    }

}