import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { EmailService } from 'src/utilities/email.service';
import { SmsService } from 'src/utilities/sms.util';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }])
  ],
  providers: [
    NotificationService, 
    EmailService, 
    SmsService,
    JwtAuthGuard,
    JwtService
  ],
  controllers: [NotificationController],
  exports: [NotificationService, MongooseModule],
})
export class NotificationModule {}
