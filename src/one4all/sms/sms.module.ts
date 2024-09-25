import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [SmsController],
  providers: [SmsService]
})
export class SmsModule {}
