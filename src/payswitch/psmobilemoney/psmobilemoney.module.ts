import { Module } from '@nestjs/common';
import { PsmobilemoneyService } from './psmobilemoney.service';
import { PsmobilemoneyController } from './psmobilemoney.controller';
import { HttpModule } from '@nestjs/axios';
import { TransactionModule } from 'src/transaction/transaction.module';
import { TransactionService } from 'src/transaction/transaction.service';

@Module({
  imports: [
    HttpModule,
    TransactionModule,
  ],
  providers: [PsmobilemoneyService],
  controllers: [PsmobilemoneyController]
})
export class PsmobilemoneyModule {}
