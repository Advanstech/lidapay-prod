import { forwardRef, Module } from '@nestjs/common';
import { ReloadAirtimeService } from './reload-airtime.service';
import { ReloadAirtimeController } from './reload-airtime.controller';
import { HttpModule } from "@nestjs/axios";
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import { AuthModule } from 'src/auth/auth.module';
import { MerchantModule } from 'src/merchant/merchant.module';
import { UserModule } from 'src/user/user.module';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MerchantAuthGuard } from 'src/auth/merchant-auth.guard';
import { UserOrMerchantGuard } from 'src/auth/user-or-merchant.guard';

@Module({
  imports: [
    HttpModule,
    TransactionModule,
    forwardRef(() => UserModule),
    forwardRef(() => MerchantModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [ReloadAirtimeController],
  providers: [
    ReloadAirtimeService, 
    TransactionService,
    UserOrMerchantGuard,
    JwtAuthGuard,
    MerchantAuthGuard
  ]

})
export class ReloadAirtimeModule {}
