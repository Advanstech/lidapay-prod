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
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const password_util_1 = require("../utilities/password.util");
const validation_util_1 = require("../utilities/validation.util");
const email_service_1 = require("../utilities/email.service");
const nodemail_service_1 = require("../utilities/nodemail.service");
const qr_code_util_1 = require("../utilities/qr-code.util");
const sms_util_1 = require("../utilities/sms.util");
const gravatar_util_1 = require("../utilities/gravatar.util");
const merchant_service_1 = require("../merchant/merchant.service");
const email_templates_1 = require("../utilities/email-templates");
const constants_1 = require("../constants");
const uuid_1 = require("uuid");
const constants_2 = require("../constants");
const common_2 = require("@nestjs/common");
const token_util_1 = require("../utilities/token.util");
const notification_service_1 = require("../notification/notification.service");
let UserService = UserService_1 = class UserService {
    constructor(userModel, emailService, nodemailService, smsService, gravatarService, merchantService, notificationService) {
        this.userModel = userModel;
        this.emailService = emailService;
        this.nodemailService = nodemailService;
        this.smsService = smsService;
        this.gravatarService = gravatarService;
        this.merchantService = merchantService;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(UserService_1.name);
        this.emailVerifyRewardPoints = process.env.EMAIL_VERIFICATION_REWARD_POINTS || constants_1.EMAIL_VERIFICATION_REWARD_POINTS;
        this.phoneVerifyRewardPoints = process.env.PHONE_VERIFICATION_REWARD_POINTS || constants_1.PHONE_VERIFICATION_REWARD_POINTS;
    }
    async create(userDto) {
        try {
            if (!validation_util_1.ValidationUtil.isValidEmail(userDto.email)) {
                throw new Error('Invalid email address');
            }
            const existingUser = await this.userModel.findOne({
                $or: [
                    { email: userDto.email },
                    { username: userDto.phoneNumber || userDto.mobile }
                ]
            });
            if (existingUser) {
                throw new common_1.ConflictException('User with this email or phone number already exists');
            }
            const hashedPassword = await password_util_1.PasswordUtil.hashPassword(userDto.password);
            const gravatarUrl = await this.gravatarService.fetchAvatar(userDto.email);
            const createdUser = new this.userModel({ ...userDto, password: hashedPassword });
            if (createdUser.roles && createdUser.roles.some(role => role.toLowerCase() === 'agent')) {
                this.logger.debug(`User QrCode Generating ==>`);
                createdUser.qrCode = await (0, qr_code_util_1.generateQrCode)(createdUser._id.toString());
            }
            createdUser.username = userDto.phoneNumber || userDto.mobile;
            createdUser.points = 0;
            createdUser.gravatar = gravatarUrl;
            await createdUser.save();
            try {
                await this.nodemailService.sendMail(userDto.email, 'Welcome to Lidapay App 👋', email_templates_1.EmailTemplates.welcomeEmail(userDto.firstName));
            }
            catch (emailError) {
                this.logger.error(`Failed to send welcome email: ${emailError.message}`);
            }
            if (userDto.referrerClientId) {
                await this.merchantService.updateRewardPoints(userDto.referrerClientId, 10);
            }
            return createdUser;
        }
        catch (error) {
            this.logger.error(`Failed to create user: ${error.message}`);
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }
    async findOneByUsername(username) {
        if (!username) {
            throw new Error('Username is required');
        }
        return this.userModel.findOne({ username }).exec();
    }
    async findOneByEmail(email) {
        if (!email) {
            throw new Error('Email is required');
        }
        return this.userModel.findOne({ email }).exec();
    }
    async findOneByPhoneNumber(phoneNumber) {
        if (!phoneNumber) {
            throw new Error('Phone number is required');
        }
        return this.userModel.findOne({ phoneNumber }).exec();
    }
    async findOneById(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return this.userModel.findById(userId).exec();
    }
    async updateProfile(userId, updateData) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        if (!updateData || typeof updateData !== 'object') {
            throw new Error('Invalid update data');
        }
        try {
            const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
            if (!updatedUser) {
                throw new Error('User not found');
            }
            const notificationData = {
                userId: updatedUser.email,
                type: 'email',
                subject: 'Profile Updated',
                message: `Your profile has been updated successfully. Details: ${JSON.stringify(updatedUser)}`
            };
            await this.notificationService.create(notificationData);
            return updatedUser;
        }
        catch (error) {
            this.logger.error(`Failed to update user profile: ${error.message}`);
            if (error.name === 'ValidationError') {
                throw new common_2.BadRequestException('Invalid update data');
            }
            else if (error.name === 'CastError') {
                throw new common_1.NotFoundException('User not found');
            }
            else {
                throw new common_2.InternalServerErrorException('Failed to update user profile');
            }
        }
    }
    async addPoints(userId, points) {
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, { $inc: { points: points } }, { new: true, runValidators: true });
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return updatedUser;
    }
    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        try {
            const users = await this.userModel.find().skip(skip).limit(limit).exec();
            const totalCount = await this.userModel.countDocuments().exec();
            const totalPages = Math.ceil(totalCount / limit);
            return { users, totalCount, totalPages };
        }
        catch (error) {
            this.logger.error(`Failed to get all users: ${error.message}`);
            throw new common_2.InternalServerErrorException('Failed to get all users');
        }
    }
    async deleteUserById(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        try {
            const result = await this.userModel.findByIdAndDelete(userId).exec();
            if (!result) {
                throw new common_1.NotFoundException('User not found');
            }
            return { message: 'User successfully deleted' };
        }
        catch (error) {
            this.logger.error(`Failed to delete user: ${error.message}`);
            throw new common_2.InternalServerErrorException('Failed to delete user');
        }
    }
    async deleteAllUsers() {
        try {
            await this.userModel.deleteMany({}).exec();
            return { message: 'All users successfully deleted' };
        }
        catch (error) {
            this.logger.error(`Failed to delete all users: ${error.message}`);
            throw new common_2.InternalServerErrorException('Failed to delete all users');
        }
    }
    async updatePassword(userId, newHashedPassword) {
        await this.userModel.findByIdAndUpdate(userId, { password: newHashedPassword });
    }
    async trackQRCodeUsage(userId) {
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, {
            $inc: { qrCodeUsageCount: 1 },
            $set: { lastQRCodeUsage: new Date() }
        }, { new: true, runValidators: true });
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.addPoints(userId, constants_1.QR_CODE_SCAN_REWARD_POINTS);
        return updatedUser;
    }
    async getQRCodeUsageStats(userId) {
        const user = await this.userModel.findById(userId, 'qrCodeUsageCount lastQRCodeUsage');
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            usageCount: user.qrCodeUsageCount || 0,
            lastUsed: user.lastQRCodeUsage || null,
        };
    }
    async awardPoints(userId, points) {
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, { $inc: { points: points } }, { new: true, runValidators: true });
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return updatedUser;
    }
    async generateInvitationLink(phoneNumber) {
        const user = await this.userModel.findOne({ phoneNumber });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const currentDate = new Date().toISOString().replace(/-/g, '').slice(0, 8);
        const invitationLink = `${process.env.DOMAIN_URL}/invite/${currentDate}/${user.firstName}/${(0, uuid_1.v4)()}`;
        user.invitationLink = invitationLink;
        await user.save();
        return invitationLink;
    }
    async trackInvitationLinkUsage(invitationLink) {
        try {
            const user = await this.userModel.findOne({ invitationLink });
            this.logger.debug(`User: ${user._id}`);
            if (!user) {
                throw new common_1.NotFoundException('Invalid invitation link');
            }
            const updatedUser = await this.userModel.findByIdAndUpdate(user._id, {
                $inc: { invitationLinkUsageCount: 1 },
                $set: { lastInvitationLinkUsage: new Date() }
            }, { new: true, runValidators: true });
            if (!updatedUser) {
                throw new common_1.NotFoundException('User not found after update');
            }
            await this.addPoints(user._id.toString(), constants_2.INVITATION_LINK_REWARD_POINTS);
            return updatedUser;
        }
        catch (error) {
            this.logger.error(`Failed to track invitation link usage: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_2.InternalServerErrorException('Failed to track invitation link usage');
        }
    }
    async getInvitationLinkStats(userId) {
        const user = await this.userModel.findById(userId, 'invitationLinkUsageCount lastInvitationLinkUsage');
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        return {
            usageCount: user.invitationLinkUsageCount || 0,
            lastUsed: user.lastInvitationLinkUsage || null,
        };
    }
    async verifyEmail(email, token) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.verificationToken !== token) {
            throw new common_1.UnauthorizedException('Invalid verification token');
        }
        if (user.emailVerified) {
            return user;
        }
        user.emailVerified = true;
        user.verificationToken = null;
        await user.save();
        try {
            await this.nodemailService.sendMail(user.email, 'Email Verification Successful', email_templates_1.EmailTemplates.emailVerificationSuccess(user.firstName));
        }
        catch (emailError) {
            this.logger.error(`Failed to send verification success email: ${emailError.message}`);
        }
    }
    async resendVerificationEmail(email) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.emailVerified) {
            throw new common_2.BadRequestException('User is already verified');
        }
        const verificationToken = (0, uuid_1.v4)();
        user.verificationToken = verificationToken;
        user.emailVerificationToken = verificationToken;
        user.points += Number(this.emailVerifyRewardPoints);
        await user.save();
        await this.sendVerificationEmail(user, verificationToken);
    }
    async sendVerificationEmail(user, verificationToken) {
        const url = `${process.env.DOMAIN_URL}/auth/verify-email/${verificationToken}`;
        const message = `Click the link below to verify your email address: ${url}`;
        await this.emailService.sendMail(user.email, 'Verify your email address', message);
    }
    async verifyPhoneNumber(phoneNumber, verificationCode) {
        const user = await this.userModel.findOne({ phoneNumber });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.phoneVerified) {
            throw new common_2.BadRequestException('User is already verified');
        }
        if (verificationCode !== user.phoneNumberVerificationCode) {
            throw new common_2.BadRequestException('Invalid verification code');
        }
        user.phoneVerified = true;
        user.phoneNumberVerificationCode = null;
        user.points += Number(this.phoneVerifyRewardPoints);
        await user.save();
    }
    async sendPhoneNumberVerificationCode(phoneNumber) {
        const user = await this.userModel.findOne({ phoneNumber });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const verificationCode = token_util_1.TokenUtil.generateVerificationCode();
        user.phoneNumberVerificationCode = verificationCode;
        await user.save();
        await this.smsService.sendSms(phoneNumber, `Your verification code is: ${verificationCode}`);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        email_service_1.EmailService,
        nodemail_service_1.NodemailService,
        sms_util_1.SmsService,
        gravatar_util_1.GravatarService,
        merchant_service_1.MerchantService,
        notification_service_1.NotificationService])
], UserService);
//# sourceMappingURL=user.service.js.map