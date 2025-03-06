import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { DatabaseModule } from '@libs/database';

@Module({
  imports: [DatabaseModule],
  providers: [GatewayService],
  exports: [GatewayService],
})

export class GatewayModule { }