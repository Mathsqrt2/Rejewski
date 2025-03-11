import { Injectable } from "@nestjs/common";
import { Message } from "discord.js";

@Injectable()
export class ContentService {

    public detectMaliciousLinks = async (message: Message): Promise<boolean> => {
        // placeholder todo
        return false;
    }

    public detectProfanity = async (message: Message): Promise<boolean> => {
        // placeholder todo
        return false;
    }


}