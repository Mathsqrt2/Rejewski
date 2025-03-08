import { InjectDiscordClient } from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { Client } from "discord.js";

@Injectable()
export class MessagesService {

    constructor(
        @InjectDiscordClient() private readonly client: Client,
    ) { }



    public displayServerRules = async (channelId: string): Promise<void> => {

    }

    public displayInviteMessage = async (channelId: string): Promise<void> => {

    }

    public askAboutEmail = async (channelId: string): Promise<void> => {

    }

    public askAboutCode = async (channelId: string): Promise<void> => {

    }



}