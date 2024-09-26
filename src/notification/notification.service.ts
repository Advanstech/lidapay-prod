import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { EmailService } from '../utilities/email.service';
import { SmsService } from '../utilities/sms.util';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) { }

  // create notification
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const createdNotification = new this.notificationModel({
      ...createNotificationDto,
      status: 'pending',
    });
    const savedNotification = await createdNotification.save();
    if (createNotificationDto.type === 'email') {
      const emailStatus = await this.emailService.sendMail(
        createNotificationDto.userId,
        'Notification',
        createNotificationDto.message
      );
      savedNotification.status = emailStatus ? 'sent' : 'failed';
    } else if (createNotificationDto.type === 'sms') {
      const smsStatus = await this.smsService.sendSms(createNotificationDto.userId, createNotificationDto.message);
      savedNotification.status = smsStatus ? 'sent' : 'failed';
    }

    return savedNotification.save();
  }
  // Create notification  with email and sms
  async createNotificationWithEmailAndSms(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const createdNotification = new this.notificationModel({
      ...createNotificationDto,
      status: 'pending',
    });
    const savedNotification = await createdNotification.save();
    const emailStatus = await this.emailService.sendMail(
      createNotificationDto.userId,
      'Notification',
      createNotificationDto.message
    );
    savedNotification.status = emailStatus ? 'sent' : 'failed';
    const smsStatus = await this.smsService.sendSms(createNotificationDto.userId, createNotificationDto.message);
    savedNotification.status = smsStatus ? 'sent' : 'failed';
    return savedNotification.save();
  }
  // Get all notifications
  async findAll(): Promise<Notification[]> {
    return this.notificationModel.find().exec();
  }
  // Get notification by id
  async findOne(id: string): Promise<Notification> {
    return this.notificationModel.findById(id).exec();
  }
  // Update notification
  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    return this.notificationModel.findByIdAndUpdate(id, updateNotificationDto, { new: true }).exec();
  }
  // Delete notification
  async delete(id: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(id).exec();
  }
}
