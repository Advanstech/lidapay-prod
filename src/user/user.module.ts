import { forwardRef, Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { EmailService } from '../utilities/email.service';
import { SmsService } from '../utilities/sms.util';
import { AuthModule } from '../auth/auth.module';
import { GravatarService } from 'src/utilities/gravatar.util';
import { MerchantService } from 'src/merchant/merchant.service';
import { MerchantModule } from 'src/merchant/merchant.module';
import { NodemailService } from 'src/utilities/nodemail.service';
import { ConfigModule } from '@nestjs/config';
import { RewardModule } from 'src/reward/reward.module';
import { NotificationModule } from 'src/notification/notification.module';
import { Wallet, WalletSchema } from 'src/user/schemas/wallet.schema';
import AccountSchema from './schemas/account.schema';
import { AddCountryFieldMigration } from './migrations/add-country-field';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema}]),
    MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),
    forwardRef(() => AuthModule),
    forwardRef(() => MerchantModule),
    RewardModule,
    NotificationModule
  ],
  controllers: [UserController],
  providers: [
    UserService, 
    EmailService, 
    SmsService,
    GravatarService,
    MerchantService,
    NodemailService,
    AddCountryFieldMigration,
  ],
  exports: [UserService, MongooseModule], // Export UserService and MongooseModule
})
export class UserModule { }
