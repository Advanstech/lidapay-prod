import { Module } from '@nestjs/common';
import { MobileMoneyService } from './mobile-money/mobile-money.service';
import { CardPaymentService } from './card-payment/card-payment.service';
import { HttpModule } from '@nestjs/axios';
import { TransactionModule } from 'src/transaction/transaction.module';
import { AdvansispayController } from './advansispay.controller';
import { ExpressPayService } from './express-pay.service';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { EmailService } from 'src/utilities/email.service';
import { NodemailService } from 'src/utilities/nodemail.service';
import { SmsService } from 'src/utilities/sms.util';
import { GravatarService } from 'src/utilities/gravatar.util';
import { MerchantService } from 'src/merchant/merchant.service';
import { NotificationService } from 'src/notification/notification.service';
import { MerchantModule } from 'src/merchant/merchant.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    HttpModule,
    TransactionModule,
    UserModule,
    MerchantModule,
    NotificationModule
  ],
  providers: [
    MobileMoneyService, 
    CardPaymentService, 
    ExpressPayService,
    UserService,
    EmailService,
    NodemailService,
    SmsService,
    GravatarService,
    MerchantService,
    NotificationService,
    AuthService,
    JwtService
  ],
  controllers: [AdvansispayController]
})
export class AdvansispayModule {}
