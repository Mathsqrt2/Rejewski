import { Email } from "@libs/database/entities/email.entity";
import { WrongEmail } from "@libs/enums/wrongEmail.enum";
import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "discord.js";
import { Repository } from "typeorm";
import { SHA512 } from "crypto-js";

@Injectable()
export class ContentService implements OnApplicationBootstrap {

    private emails: Email[] = [];
    constructor(
        @InjectRepository(Email) private readonly email: Repository<Email>
    ) { }

    public async onApplicationBootstrap() {
        this.emails = await this.email.find();
    }

    public detectEmail = (message: string): [string, WrongEmail] => {

        let email: string = null;

        if (!message.includes(`@`)) {
            return [null, WrongEmail.missingEmail];
        }

        if (message.split(`@`).length > 2) {
            return [null, WrongEmail.tooManyEmails];
        }

        const words: string[] = message.split(" ");
        for (const word of words) {
            if (word.includes(`@`)) {
                email = word;
                break;
            }
        }

        if (!email) {
            return [null, WrongEmail.missingEmail];
        }

        if (!email.match(/^[\w-\.]+@(student\.)?po\.edu\.pl$/g)) {
            return [null, WrongEmail.incorrectEmail];
        }

        const emailHash: string = SHA512(email).toString();
        if (this.emails.some(usedEmail => usedEmail.emailHash === emailHash)) {
            return [null, WrongEmail.emailInUse];
        }

        if (!email.endsWith(`@po.edu.pl`) && !email.endsWith(`@student.po.edu.pl`)) {
            return [null, WrongEmail.wrongDomain];
        }

        return [email, null];
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