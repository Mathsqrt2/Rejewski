import { DatabaseService } from './database.service';
import { Module } from '@nestjs/common';
import * as path from 'path';

@Module({
  providers: [
    DatabaseService
  ],
  exports: [
    DatabaseService
  ],
})
export class DatabaseModule { }
