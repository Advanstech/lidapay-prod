import { forwardRef, Module } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Merchant, MerchantSchema } from './schemas/merchant.schema';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { RewardService } from 'src/reward/reward.service';
import { RewardModule } from 'src/reward/reward.module';
import { MerchantAuthGuard } from 'src/auth/merchant-auth.guard';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { EmailService } from 'src/utilities/email.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationModule } from 'src/notification/notification.module';
import { SmsService } from 'src/utilities/sms.util';
import { NodemailService } from 'src/utilities/nodemail.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Merchant.name, schema: MerchantSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    RewardModule,
    NotificationModule
  ],
  providers: [
    MerchantService,
    RewardService,
    MerchantAuthGuard,
    JwtStrategy,
    EmailService,
    NotificationService,
    SmsService,
    NodemailService
  ],
  controllers: [MerchantController],
  exports: [MerchantService, MongooseModule], // Export MerchantService

})
export class MerchantModule {}
