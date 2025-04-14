import { Dictionary } from "@libs/database/entities/dictionary.entity";
import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { Email } from "@libs/database/entities/email.entity";
import { WrongEmail } from "@libs/enums/wrongEmail.enum";
import { WrongCode } from "@libs/enums/wrongCode.enum";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "discord.js";
import { Repository } from "typeorm";
import { SHA512 } from "crypto-js";

@Injectable()
export class ContentService implements OnApplicationBootstrap {

    private blackListedUrls: Dictionary[] = [];
    private blackListedWords: Dictionary[] = [];
    private emails: Email[] = [];

    constructor(
        @InjectRepository(Dictionary) private readonly dictionary: Repository<Dictionary>,
        @InjectRepository(Email) private readonly email: Repository<Email>
    ) { }

    public onApplicationBootstrap = async (): Promise<void> => {
        await this.updateData();
    }

    public updateData = async (): Promise<void> => {
        const blackList = await this.dictionary.find({ where: { blackList: true } });
        this.blackListedUrls = blackList.filter(word => word.isUrl);
        this.blackListedWords = blackList.filter(word => !word.isUrl);

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
        if (this.emails.some(usedEmail => (
            usedEmail.emailHash === emailHash &&
            usedEmail.isConfirmed
        ))) {
            return [null, WrongEmail.emailInUse];
        }

        if (!email.endsWith(`@po.edu.pl`) && !email.endsWith(`@student.po.edu.pl`)) {
            return [null, WrongEmail.wrongDomain];
        }

        return [email, null];
    }

    public detectCode = async (message: Message): Promise<[string, WrongCode]> => {

        //todo
        return [message.content, null];
    }

    public detectMaliciousLinks = (message: Message): [boolean, string[]] => {

        const matches: string[] = [];
        const words: string[] = message.content.split(` `);

        for (const word of words) {
            if (this.blackListedUrls.some(restrictedLink => restrictedLink.phrase === word)) {
                matches.push(word);
            }
        }

        return [!!matches.length, matches];
    }

    public detectProfanity = (message: Message): [boolean, string[]] => {

        const matches: string[] = [];
        const words: string[] = message.content.split(` `);

        for (const word of words) {
            if (this.blackListedWords.some(restrictedWord => restrictedWord.phrase === word)) {
                matches.push(word);
            }
        }

        return [!!matches.length, matches];
    }


}