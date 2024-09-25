import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MerchantAuthGuard } from '../auth/merchant-auth.guard';
import { UserOrMerchantGuard } from '../auth/user-or-merchant.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    JwtAuthGuard,
    MerchantAuthGuard,
    UserOrMerchantGuard,
  ],
  exports: [TransactionService, MongooseModule] // Export MongooseModule as well
})
export class TransactionModule {}
