import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PscardpaymentController } from './pscardpayment.controller';
import { PscardpaymentService } from './pscardpayment.service';

@Module({
  imports: [HttpModule],
  providers: [PscardpaymentService],
  controllers: [PscardpaymentController]
})
export class PscardpaymentModule {}
