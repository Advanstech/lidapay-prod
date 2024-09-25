import { Module } from '@nestjs/common';
import { MobilemoneyService } from './mobilemoney.service';
import { MobilemoneyController } from './mobilemoney.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [MobilemoneyService],
  controllers: [MobilemoneyController],
})
export class MobilemoneyModule {}
