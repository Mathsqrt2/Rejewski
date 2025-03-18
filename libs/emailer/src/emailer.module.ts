import { VerificationModule } from '@libs/verification';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailerService } from './emailer.service';
import { DatabaseModule } from '@libs/database';
import { Module } from '@nestjs/common';
import { LoggerModule } from '@libs/logger';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
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
    }),
    VerificationModule,
    DatabaseModule,
    LoggerModule,
  ],
  providers: [EmailerService],
  exports: [EmailerService],
})

export class EmailerModule { }