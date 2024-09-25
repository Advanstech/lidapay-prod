import { forwardRef, Module } from '@nestjs/common';
import { ReloadlyController } from './reloadly.controller';
import { ReloadlyService } from "./reloadly.service";
import { HttpModule } from "@nestjs/axios";
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserOrMerchantGuard } from 'src/auth/user-or-merchant.guard';
import { MerchantAuthGuard } from 'src/auth/merchant-auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { MerchantModule } from 'src/merchant/merchant.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    HttpModule,
    TransactionModule,
    forwardRef(() => UserModule),
    forwardRef(() => MerchantModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [ReloadlyController],
  providers: [
    ReloadlyService,
    TransactionService,
    UserOrMerchantGuard,
    JwtAuthGuard,
    MerchantAuthGuard
  ]
})
export class ReloadlyModule {}
