import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { AirtimeController } from './airtime.controller';
import { AirtimeService } from './airtime.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import { MerchantService } from 'src/merchant/merchant.service';
import { MerchantModule } from 'src/merchant/merchant.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { EmailService } from 'src/utilities/email.service';
import { NotificationService } from 'src/notification/notification.service';
import { SmsService } from 'src/utilities/sms.util';
import { NotificationModule } from 'src/notification/notification.module';
import { UserOrMerchantGuard } from 'src/auth/user-or-merchant.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Module({
  imports: [
    HttpModule,
    TransactionModule,
    forwardRef(() => UserModule),
    forwardRef(() => MerchantModule),
    forwardRef(() => AuthModule),
    NotificationModule
  ],
  controllers: [AirtimeController],
  providers: [
    AirtimeService, 
    TransactionService,
    MerchantService,
    EmailService,
    NotificationService,
    SmsService,
    UserOrMerchantGuard,
    JwtAuthGuard
  ],
  exports: [AirtimeService]
})
export class AirtimeModule {}
