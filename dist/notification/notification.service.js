"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("./schemas/notification.schema");
const email_service_1 = require("../utilities/email.service");
const sms_util_1 = require("../utilities/sms.util");
let NotificationService = class NotificationService {
    constructor(notificationModel, emailService, smsService) {
        this.notificationModel = notificationModel;
        this.emailService = emailService;
        this.smsService = smsService;
    }
    async create(createNotificationDto) {
        const createdNotification = new this.notificationModel({
            ...createNotificationDto,
            status: 'pending',
        });
        const savedNotification = await createdNotification.save();
        if (createNotificationDto.type === 'email') {
            const emailStatus = await this.emailService.sendMail(createNotificationDto.userId, 'Notification', createNotificationDto.message);
            savedNotification.status = emailStatus ? 'sent' : 'failed';
        }
        else if (createNotificationDto.type === 'sms') {
            const smsStatus = await this.smsService.sendSms(createNotificationDto.userId, createNotificationDto.message);
            savedNotification.status = smsStatus ? 'sent' : 'failed';
        }
        return savedNotification.save();
    }
    async findAll() {
        return this.notificationModel.find().exec();
    }
    async findOne(id) {
        return this.notificationModel.findById(id).exec();
    }
    async update(id, updateNotificationDto) {
        return this.notificationModel.findByIdAndUpdate(id, updateNotificationDto, { new: true }).exec();
    }
    async delete(id) {
        await this.notificationModel.findByIdAndDelete(id).exec();
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        email_service_1.EmailService,
        sms_util_1.SmsService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map