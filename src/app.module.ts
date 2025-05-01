import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { databaseEntities } from '@libs/database/database.providers';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DiscordModule } from '@discord-nestjs/core';
import { Logger, LoggerModule } from '@libs/logger';
import { BotIntents } from './discord/bot.intents';
import { ScheduleModule } from '@nestjs/schedule';
import { BotModule } from './discord/bot.module';
import { SettingsModule } from '@libs/settings';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestModule } from './test/test.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    EventEmitterModule.forRoot({ global: true }),
    ConfigModule.forRoot({ isGlobal: true }),
    DiscordModule.forRootAsync(BotIntents),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature(databaseEntities),
    SettingsModule,
    LoggerModule,
    BotModule,
    TestModule,
  ]
})

export class AppModule implements NestModule {
  public async configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Logger)
      .forRoutes({
        path: `*`,
        method: RequestMethod.ALL
      });
  }
}