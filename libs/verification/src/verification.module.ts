import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseEntities } from '@libs/database/database.providers';

@Module({
  imports: [
    TypeOrmModule.forFeature([...databaseEntities]),
  ],
  providers: [
    VerificationService
  ],
  exports: [
    VerificationService
  ],
})
export class VerificationModule { }
