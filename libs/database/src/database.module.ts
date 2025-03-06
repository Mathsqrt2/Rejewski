import { databaseEntities } from './database.providers';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        type: process.env.DB_TYPE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [...databaseEntities],
        synchronize: true
      })
    }),
    TypeOrmModule.forFeature([...databaseEntities]),
  ],
  providers: [
    DatabaseService
  ],
  exports: [
    DatabaseService
  ],
})
export class DatabaseModule { }
