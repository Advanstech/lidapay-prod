import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { EmailService } from '../utilities/email.service';
import { SmsService } from '../utilities/sms.util';
export declare class NotificationService {
    private notificationModel;
    private readonly emailService;
    private readonly smsService;
    constructor(notificationModel: Model<NotificationDocument>, emailService: EmailService, smsService: SmsService);
    create(createNotificationDto: CreateNotificationDto): Promise<Notification>;
    findAll(): Promise<Notification[]>;
    findOne(id: string): Promise<Notification>;
    update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification>;
    delete(id: string): Promise<void>;
}
