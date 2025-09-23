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
const wallet_schema_1 = require("./schemas/wallet.schema");
const password_util_1 = require("../utilities/password.util");
const validation_util_1 = require("../utilities/validation.util");
const email_service_1 = require("../utilities/email.service");
const nodemail_service_1 = require("../utilities/nodemail.service");
const sms_util_1 = require("../utilities/sms.util");
const gravatar_util_1 = require("../utilities/gravatar.util");
const merchant_service_1 = require("../merchant/merchant.service");
const email_templates_1 = require("../utilities/email-templates");
const constants_1 = require("../constants");
const uuid_1 = require("uuid");
const common_2 = require("@nestjs/common");
const token_util_1 = require("../utilities/token.util");
const notification_service_1 = require("../notification/notification.service");
const mongoose_3 = require("mongoose");
const generator_util_1 = require("../utilities/generator.util");
let UserService = UserService_1 = class UserService {
    constructor(userModel, walletModel, accountModel, emailService, nodemailService, smsService, gravatarService, merchantService, notificationService) {
        this.userModel = userModel;
        this.walletModel = walletModel;
        this.accountModel = accountModel;
        this.emailService = emailService;
        this.nodemailService = nodemailService;
        this.smsService = smsService;
        this.gravatarService = gravatarService;
        this.merchantService = merchantService;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(UserService_1.name);
        this.emailVerifyRewardPoints = process.env.EMAIL_VERIFICATION_REWARD_POINTS ||
            constants_1.EMAIL_VERIFICATION_REWARD_POINTS;
        this.phoneVerifyRewardPoints = process.env.PHONE_VERIFICATION_REWARD_POINTS ||
            constants_1.PHONE_VERIFICATION_REWARD_POINTS;
    }
    async create(userDto) {
        try {
            this.logger.debug('Creating user with DTO:', userDto);
            if (!validation_util_1.ValidationUtil.isValidEmail(userDto.email)) {
                throw new Error('Invalid email address');
            }
            const existingUser = await this.userModel.findOne({
                $or: [
                    { email: userDto.email },
                    { username: userDto.phoneNumber || userDto.mobile },
                ],
            });
            if (existingUser) {
                throw new common_1.ConflictException('User with this email or phone number already exists');
            }
            const hashedPassword = await password_util_1.PasswordUtil.hashPassword(userDto.password);
            const gravatarUrl = await this.gravatarService.fetchAvatar(userDto.email);
            const username = userDto.username || userDto.phoneNumber || userDto.mobile;
            const createdUser = new this.userModel({
                ...userDto,
                username,
                password: hashedPassword,
                points: 0,
                gravatar: gravatarUrl,
            });
            const accountNumber = await generator_util_1.GeneratorUtil.generateAccountNumber();
            const accountData = {
                userId: createdUser._id,
                accountId: accountNumber,
                balance: 0,
                transactions: []
            };
            const createdAccount = await this.accountModel.create(accountData);
            createdUser.account = createdAccount._id;
            this.logger.debug('Creating wallet for user');
            const wallet = new this.walletModel({
                user: createdUser._id,
                mobileMoneyAccounts: [
                    { number: userDto.phoneNumber || userDto.mobile, provider: 'MTN' },
                ],
            });
            await wallet.save();
            this.logger.debug(`Wallet created for user ${createdUser._id}: ${JSON.stringify(wallet)}`);
            createdUser.wallet = wallet._id;
            await createdUser.save();
            try {
                await this.nodemailService.sendMail(userDto.email, 'Welcome to Lidapay App 👋', email_templates_1.EmailTemplates.welcomeEmail(userDto.firstName, userDto.phoneNumber || userDto.mobile, accountNumber));
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
    async findOneByEmailOrPhoneNumber(email, phoneNumber) {
        if (!email && !phoneNumber) {
            throw new Error('Email or phone number is required');
        }
        return this.userModel.findOne({ $or: [{ email }, { phoneNumber }] }).exec();
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
            const updatedUser = await this.userModel
                .findByIdAndUpdate(userId, updateData, { new: true })
                .exec();
            if (!updatedUser) {
                throw new Error('User not found');
            }
            const notificationData = {
                userId: updatedUser.email,
                type: 'email',
                subject: 'Profile Updated',
                message: `Your profile has been updated successfully. Details: ${JSON.stringify(updatedUser)}`,
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
            await this.walletModel.findOneAndDelete({ user: userId }).exec();
            await this.accountModel.findOneAndDelete({ user: userId }).exec();
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
    async suspendAccount(userId) {
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, { suspended: true }, { new: true, runValidators: true });
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return updatedUser;
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
    async updatePassword(userId, newPassword) {
        try {
            const newHashedPassword = await password_util_1.PasswordUtil.hashPassword(newPassword);
            await this.userModel.findByIdAndUpdate(userId, { password: newHashedPassword });
        }
        catch (error) {
            throw new Error(`Failed to update password: ${error.message}`);
        }
    }
    async trackQRCodeUsage(userId) {
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, {
            $inc: { qrCodeUsageCount: 1 },
            $set: { lastQRCodeUsage: new Date() },
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
    async generateInvitationLink(username) {
        const user = await this.userModel.findOne({ username });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const currentDate = new Date().toISOString().replace(/-/g, '').slice(0, 8);
        const invitationLink = `${process.env.DOMAIN_URL}/invite/${currentDate}/${user.firstName}/${(0, uuid_1.v4)()}`;
        const newInvitationLink = {
            link: invitationLink,
            createdAt: new Date(),
            lastUsed: null,
            usageCount: 0,
            pointsEarned: 0,
        };
        user.invitationLinks.push(newInvitationLink);
        await user.save();
        this.logger.log(`User generated link => ${invitationLink}`);
        return invitationLink;
    }
    async trackInvitationLinkUsage(invitationLink) {
        try {
            const user = await this.userModel.findOne({
                'invitationLinks.link': invitationLink,
            });
            if (!user) {
                throw new common_1.NotFoundException('Invalid invitation link');
            }
            const linkIndex = user.invitationLinks.findIndex((link) => link.link === invitationLink);
            if (linkIndex === -1) {
                throw new common_1.NotFoundException('Invitation link not found for this user');
            }
            const INVITATION_LINK_REWARD_POINTS = 10;
            user.invitationLinks[linkIndex].lastUsed = new Date();
            user.invitationLinks[linkIndex].usageCount += 1;
            user.invitationLinks[linkIndex].pointsEarned +=
                INVITATION_LINK_REWARD_POINTS;
            user.totalPointsEarned =
                (user.totalPointsEarned || 0) + INVITATION_LINK_REWARD_POINTS;
            user.points = (user.points || 0) + INVITATION_LINK_REWARD_POINTS;
            const updatedUser = await user.save();
            if (!updatedUser) {
                throw new common_1.NotFoundException('User not found after update');
            }
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
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        const totalUsageCount = user.invitationLinks.reduce((sum, link) => sum + link.usageCount, 0);
        const totalPointsEarned = user.totalPointsEarned || 0;
        return {
            totalUsageCount,
            totalPointsEarned,
            userTotalPoints: user.points || 0,
            invitationLinks: user.invitationLinks,
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
    async validateWallet(userId) {
        const user = await this.userModel
            .findById(userId)
            .populate('wallet')
            .exec();
        if (!user || !user.wallet) {
            throw new common_1.NotFoundException('User or wallet not found');
        }
        const wallet = user.wallet;
        const hasMobileMoney = wallet.mobileMoneyAccounts && wallet.mobileMoneyAccounts.length > 0;
        const hasCard = wallet.cardDetails && wallet.cardDetails.length > 0;
        if (!hasMobileMoney && !hasCard) {
            throw new common_2.BadRequestException('User must have at least one payment method in their wallet');
        }
    }
    async purchaseAirtime(userId, amount) {
        await this.validateWallet(userId);
    }
    async validateUserAccounts(userId) {
        const user = await this.userModel
            .findById(userId)
            .populate('wallet Account')
            .exec();
        if (!user || !user.wallet || !user.account) {
            throw new common_1.NotFoundException('User, wallet, or Lidapay account not found');
        }
        const wallet = user.wallet;
        const bankAccount = user.account;
        const hasMobileMoney = wallet.mobileMoneyAccounts && wallet.mobileMoneyAccounts.length > 0;
        const hasCard = wallet.cardDetails && wallet.cardDetails.length > 0;
        if (!hasMobileMoney && !hasCard) {
            throw new common_2.BadRequestException('User must have at least one payment method in their wallet');
        }
        if (bankAccount.balance <= 0) {
            throw new common_2.BadRequestException('Insufficient funds in Lidapa account');
        }
    }
    async createOrUpdateWallet(userId, walletData) {
        const wallet = await this.walletModel
            .findOneAndUpdate({ user: userId }, walletData, { new: true, upsert: true })
            .exec();
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        return wallet;
    }
    async getWalletById(walletId) {
        return this.walletModel.findById(walletId).exec();
    }
    async getWalletByUserId(userId) {
        this.logger.debug(`Querying wallet for user ID: ${userId}`);
        if (!mongoose_3.Types.ObjectId.isValid(userId)) {
            this.logger.error(`Invalid user ID: ${userId}`);
            throw new common_1.NotFoundException(`Invalid user ID: ${userId}`);
        }
        try {
            const wallet = await this.walletModel.findOne({ user: new mongoose_3.Types.ObjectId(userId) }).exec();
            if (!wallet) {
                this.logger.warn(`Wallet not found for user ID: ${userId}`);
                throw new common_1.NotFoundException(`Wallet not found for user ID: ${userId}`);
            }
            this.logger.debug(`Retrieved wallet for user ${userId}: ${JSON.stringify(wallet)}`);
            return wallet;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error retrieving wallet for user ${userId}: ${error.message}`);
            throw new common_1.NotFoundException(`Error retrieving wallet for user ID: ${userId}`);
        }
    }
    async deleteWalletByUserId(userId) {
        const result = await this.walletModel
            .findOneAndDelete({ user: userId })
            .exec();
        if (!result) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        return { message: 'Wallet successfully deleted' };
    }
    async getAccountById(accountId) {
        return this.accountModel.findById(accountId).exec();
    }
    async getUserAccount(userId) {
        const user = await this.userModel.findById(userId).populate('account').exec();
        if (!user || !user.account) {
            throw new common_1.NotFoundException('User or account not found');
        }
        return user.account;
    }
    async createOrUpdateUserBankAccount(userId, accountData) {
        const userBankAccount = await this.accountModel
            .findOneAndUpdate({ user: userId }, accountData, { new: true, upsert: true })
            .exec();
        if (!userBankAccount) {
            throw new common_1.NotFoundException('User Bank account not found');
        }
        return userBankAccount;
    }
    async deleteUserBankAccount(userId) {
        const result = await this.accountModel
            .findOneAndDelete({ user: userId })
            .exec();
        if (!result) {
            throw new common_1.NotFoundException('User Bank account not found');
        }
        return { message: 'User Bank account successfully deleted' };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(wallet_schema_1.Wallet.name)),
    __param(2, (0, mongoose_1.InjectModel)('Account')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        email_service_1.EmailService,
        nodemail_service_1.NodemailService,
        sms_util_1.SmsService,
        gravatar_util_1.GravatarService,
        merchant_service_1.MerchantService,
        notification_service_1.NotificationService])
], UserService);
//# sourceMappingURL=user.service.js.map