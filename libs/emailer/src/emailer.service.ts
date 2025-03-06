import { VerificationService } from '@libs/verification';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailerService {

    constructor(
        private readonly verificationCode: VerificationService,
        private readonly mailerService: MailerService,
    ) { }

    private buildVerificationMessage = (): string => {

        let message: string = ``;

        return `placeholder`;
    }

    private buildHTMLFromMessage = (message: string, subject?: string): string => {
        let html: string = ``;
        html += subject ? `<h3>${subject}<h3>` : ``;
        html += message.replaceAll(`\n`, `<br>`);
        return;
    }

    public sendVerificationEmailTo = (email: string) => {

        const text: string = this.buildVerificationMessage();
        const subject: string = `Zweryfikuj się na serwerze`;

        try {

            this.mailerService.sendMail({
                to: email,
                subject,
                text,
                html: this.buildHTMLFromMessage(text, subject),
            })

        } catch (error) {

        }


    }


}
