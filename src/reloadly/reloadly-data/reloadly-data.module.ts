import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TransactionModule } from 'src/transaction/transaction.module';
import { UserModule } from 'src/user/user.module';
import { MerchantModule } from 'src/merchant/merchant.module';
import { AuthModule } from 'src/auth/auth.module';
import { ReloadlyDataController } from './reloadly-data.controller';
import { ReloadlyDataService } from './reloadly-data.service';
import { UserOrMerchantGuard } from 'src/auth/user-or-merchant.guard';
import { TransactionService } from 'src/transaction/transaction.service';
import { MerchantAuthGuard } from 'src/auth/merchant-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Module({
    imports: [
        HttpModule,
        TransactionModule,
        forwardRef(() => UserModule),
        forwardRef(() => MerchantModule),
        forwardRef(() => AuthModule),
    ],
    controllers: [ReloadlyDataController],
    providers: [
        ReloadlyDataService,
        TransactionService,
        UserOrMerchantGuard,
        JwtAuthGuard,
        MerchantAuthGuard
    ],
})
export class ReloadlyDataModule {
   
}
