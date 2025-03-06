import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseModule } from '@libs/database';
import { GatewayModule } from '@libs/gateway';

@Module({
  imports: [
    DatabaseModule,
    GatewayModule,
  ],
  providers: [
    AppService
  ],
})

export class AppModule { }