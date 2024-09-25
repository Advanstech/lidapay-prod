import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    create(createNotificationDto: CreateNotificationDto): Promise<import("./schemas/notification.schema").Notification>;
    findAll(): Promise<import("./schemas/notification.schema").Notification[]>;
    findOne(id: string): Promise<import("./schemas/notification.schema").Notification>;
    update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<import("./schemas/notification.schema").Notification>;
    delete(id: string): Promise<void>;
}
