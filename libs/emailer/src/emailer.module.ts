import { Module } from '@nestjs/common';
import { EmailerService } from './emailer.service';
import { DatabaseService } from '@libs/database';
import { MailerModule } from '@nestjs-modules/mailer';
import { VerificationModule } from '@libs/verification';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: process.env.SMTP_SERVICE,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: process.env.SMTP_USER,
      }
    }),
    VerificationModule,
    DatabaseService,
  ],
  providers: [EmailerService],
  exports: [EmailerService],
})

export class EmailerModule { }