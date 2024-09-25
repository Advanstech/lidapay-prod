import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { InternetController } from './internet.controller';
import { InternetService } from './internet.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { MerchantModule } from 'src/merchant/merchant.module';

@Module({
  imports: [
    HttpModule, 
    TransactionModule, 
    forwardRef(() => UserModule),
    forwardRef(() => MerchantModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [InternetController],
  providers: [InternetService, TransactionService,]
})
export class InternetModule {}
