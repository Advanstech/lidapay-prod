import { Module } from '@nestjs/common';
import { PsmobilemoneyController } from './psmobilemoney.controller';
import { HttpModule } from '@nestjs/axios';
import { TransactionModule } from 'src/transaction/transaction.module';
import { TransactionService } from 'src/transaction/transaction.service';
import { PsmobilemoneyService } from './psmobilemoney.service';

@Module({
  imports: [
    HttpModule,
    TransactionModule,
  ],
  providers: [PsmobilemoneyService, TransactionService],
  controllers: [PsmobilemoneyController]
})
export class PsmobilemoneyModule {}
