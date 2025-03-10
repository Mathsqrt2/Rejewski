import { InjectDiscordClient } from "@discord-nestjs/core";
import { AppEvents } from "@libs/enums/events.enum";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Client, Message } from "discord.js";

@Injectable()
export class MessagesService {

    constructor(
        @InjectDiscordClient() private readonly client: Client,
    ) { }


    public displayInviteMessage = async (channelId: string): Promise<void> => {

    }

    public displayServerRules = async (channelId: string): Promise<void> => {

    }


    public askAboutEmail = async (channelId: string): Promise<void> => {

    }

    public askAboutCode = async (channelId: string): Promise<void> => {

    }

    @OnEvent(AppEvents.PublicMessage, { async: true })
    public async handlePublicChannelMessage(message: Message): Promise<void> {

    }

    @OnEvent(AppEvents.AdministrationMessage, { async: true })
    public async handleAdministrationChannelMessage(message: Message): Promise<void> {

    }

    @OnEvent(AppEvents.PrivateMessage, { async: true })
    public async handlePrivateChannelMessage(message: Message): Promise<void> {

    }

    @OnEvent(AppEvents.PersonalMessage, { async: true })
    public async handlePersonalChannelMessage(message: Message): Promise<void> {

    }




}