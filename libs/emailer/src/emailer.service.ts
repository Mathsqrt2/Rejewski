import { MailerService } from '@nestjs-modules/mailer';
import CodeTemplate from './templates/code.template';
import { render } from '@react-email/components';
import { Injectable } from '@nestjs/common';
import { Content } from 'src/app.content';
import { Logger } from '@libs/logger';
import { LogsTypes } from '@libs/enums';

@Injectable()
export class EmailerService {

    constructor(
        private readonly mailerService: MailerService,
        private readonly logger: Logger,
    ) { }

    public sendVerificationEmailTo = async (email: string, code: string) => {

        const startTime: number = Date.now();
        const subject: string = Content.verificationEmail.subject();
        try {

            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

            const props = {
                subject,
                welcome: Content.verificationEmail.welcome(),
                introduction: Content.verificationEmail.introduction(),
                rulesHeading: Content.verificationEmail.rulesHeading(),
                rules: Content.verificationEmail.rules(),
                yourCode: Content.verificationEmail.yourCode(),
                code,
                aboutCode: Content.verificationEmail.aboutCode(),
                expiringDate: Content.verificationEmail.expiringDate(threeDaysFromNow.toLocaleString(`pl-PL`)),
                warning: Content.verificationEmail.warning(),
                mediaHeading: Content.verificationEmail.mediaHeading(),
                facebookLink: Content.verificationEmail.facebookLink(),
                instagramLink: Content.verificationEmail.instagramLink(),
                discordLink: Content.verificationEmail.discordLink(),
                websiteLink: Content.verificationEmail.websiteLink(),
            }

            const text: string = await render(CodeTemplate(props), { plainText: true });
            const html: string = await render(CodeTemplate(props));

            return await this.mailerService.sendMail({
                to: email,
                subject,
                text,
                html,
            });

        } catch (error) {
            this.logger.error(Content.error.failedToSendEmail(),
                { error, startTime, tag: LogsTypes.INTERNAL_ACTION_FAIL }
            );
        }

    }

}