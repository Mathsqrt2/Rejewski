import { Injectable } from "@nestjs/common";
import { Message } from "discord.js";

@Injectable()
export class ContentService {

    public detectEmail = (message: string): string => {

        if (!message.includes(`@`)) {
            throw new Error(`Email not found in the message.`);
        }

        if (message.split(`@`).length > 2) {
            throw new Error(`To many emails in the message.`);
        }

        const words: string[] = message.split(" ");
        for (const word of words) {

            if (word.includes(`@`)) {
                return word;
            }
        }
    }

    public detectMaliciousLinks = async (message: Message): Promise<boolean> => {
        // placeholder todo
        return false;
    }

    public detectProfanity = async (message: Message): Promise<boolean> => {
        // placeholder todo
        return false;
    }


}