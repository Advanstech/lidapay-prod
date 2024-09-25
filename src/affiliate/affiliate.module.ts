import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AffiliateController } from './affiliate.controller';
import { AffiliateService } from './affiliate.service';
import { Affiliate, AffiliateSchema } from './entities/affiliate.entity';
import { Referral, ReferralSchema } from './entities/referral.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Affiliate.name, schema: AffiliateSchema },
      { name: Referral.name, schema: ReferralSchema },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AffiliateController],
  providers: [AffiliateService],
  exports: [AffiliateService],
})
export class AffiliateModule {}
