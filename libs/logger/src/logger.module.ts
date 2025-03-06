import { Log } from '@libs/database/entities/log.entity';
import { DatabaseModule } from '@libs/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Logger } from './logger.service';
import { SettingsModule } from '@libs/settings';
import { databaseEntities } from '@libs/database/database.providers';

@Module({
  imports: [
    TypeOrmModule.forFeature(databaseEntities),
    DatabaseModule,
    SettingsModule,
  ],
  providers: [
    Logger
  ],
  exports: [
    Logger
  ],
})
export class LoggerModule { }
