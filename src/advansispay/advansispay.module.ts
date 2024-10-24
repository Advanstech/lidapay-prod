import { Module } from '@nestjs/common';
import { MobileMoneyService } from './mobile-money/mobile-money.service';
import { CardPaymentService } from './card-payment/card-payment.service';
import { HttpModule } from '@nestjs/axios';
import { TransactionModule } from 'src/transaction/transaction.module';
import { AdvansispayController } from './advansispay.controller';
import { ExpressPayService } from './express-pay.service';

@Module({
  imports: [
    HttpModule,
    TransactionModule,
  ],
  providers: [MobileMoneyService, CardPaymentService, ExpressPayService],
  controllers: [AdvansispayController]
})
export class AdvansispayModule {}
