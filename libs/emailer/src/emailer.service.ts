import { Logger } from '@libs/logger';
import { VerificationService } from '@libs/verification';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { render } from '@react-email/components';
import { Content } from 'src/app.content';
import codeTemplate from './templates/code.template';

@Injectable()
export class EmailerService {

    constructor(
        private readonly verificationCode: VerificationService,
        private readonly mailerService: MailerService,
        private readonly logger: Logger,
    ) { }

    public sendVerificationEmailTo = async (email: string, code: string) => {

        const subject: string = Content.verificationEmail.subject();
        try {
            const props = {
                emailTitle: `Wiadomość weryfikacyjna`,
                welcome: Content.verificationEmail.welcome(),
                introduction: Content.verificationEmail.introduction(),
                rules: Content.verificationEmail.rules(),
                code: Content.verificationEmail.code(code),
                warning: Content.verificationEmail.warning(),
            }

            await this.mailerService.sendMail({
                to: email,
                subject,
                text: await render(codeTemplate, { plainText: true }),
                html: await render(codeTemplate, { pretty: true }),
            });

        } catch (error) {
            this.logger.error(`Failed to send email.`);
        }


    }


}
