import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MerchantModule } from './merchant/merchant.module';
import { AffiliateModule } from './affiliate/affiliate.module';
import { RewardModule } from './reward/reward.module';
import { TransactionModule } from './transaction/transaction.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGODB_URI } from './constants';
import { EmailService } from './utilities/email.service';
import { SmsService } from './utilities/sms.util';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './notification/notification.module';
import { AirtimeModule } from './one4all/airtime/airtime.module';
import { InternetModule } from './one4all/internet/internet.module';
import { PsmobilemoneyModule } from './payswitch/psmobilemoney/psmobilemoney.module';
import { PscardpaymentModule } from './payswitch/pscardpayment/pscardpayment.module';
import { SmsModule } from './one4all/sms/sms.module';
import { ReloadlyModule } from './reloadly/reloadly.module';
import { AuthenticationModule } from './reloadly/authentication/authentication.module';
import { ReloadAirtimeModule } from './reloadly/reload-airtime/reload-airtime.module';
import { MobilemoneyModule } from './one4all/mobilemoney/mobilemoney.module';
import { AdvansispayModule } from './advansispay/advansispay.module';
import { ExpressPayService } from './advansispay/express-pay.service';
import { DigitalAssetLinksController } from './digital-asset-links.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // This makes ConfigModule available globally
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || MONGODB_URI),
    AuthModule,
    UserModule,
    MerchantModule,
    AffiliateModule,
    RewardModule,
    TransactionModule,
    HttpModule,
    NotificationModule,
    AirtimeModule,
    InternetModule,
    MobilemoneyModule,
    PsmobilemoneyModule,
    PscardpaymentModule,
    SmsModule,
    ReloadlyModule,
    AuthenticationModule,
    ReloadAirtimeModule,
    AffiliateModule,
    AdvansispayModule,
  ],
  controllers: [AppController, DigitalAssetLinksController],
  providers: [AppService, EmailService, SmsService, ExpressPayService],
})
export class AppModule {}
