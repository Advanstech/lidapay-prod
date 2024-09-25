import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardService } from './reward.service';
import { RewardController } from './reward.controller';
import { Reward, RewardSchema } from './schemas/reward.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reward.name, schema: RewardSchema }])
  ],
  providers: [RewardService, JwtAuthGuard, JwtService],
  controllers: [RewardController],
  exports: [RewardService, MongooseModule],
})
export class RewardModule {}
