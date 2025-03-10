import { DiscordModule } from '@discord-nestjs/core';
import { BotIntents } from './discord/bot.intents';
import { ScheduleModule } from '@nestjs/schedule';
import { BotModule } from './discord/bot.module';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot({ global: true }),
    ConfigModule.forRoot({ isGlobal: true }),
    DiscordModule.forRootAsync(BotIntents),
    ScheduleModule.forRoot(),
    BotModule,
  ]
})

export class AppModule { }