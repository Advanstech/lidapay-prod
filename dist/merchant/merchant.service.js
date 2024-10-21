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
var MerchantService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const merchant_schema_1 = require("./schemas/merchant.schema");
const uuid_1 = require("uuid");
const password_util_1 = require("../utilities/password.util");
const token_util_1 = require("../utilities/token.util");
const qr_code_util_1 = require("../utilities/qr-code.util");
const constants_1 = require("../constants");
const auth_service_1 = require("../auth/auth.service");
const user_service_1 = require("../user/user.service");
const email_service_1 = require("../utilities/email.service");
const notification_service_1 = require("../notification/notification.service");
const email_templates_1 = require("../utilities/email-templates");
const nodemail_service_1 = require("../utilities/nodemail.service");
const jwt_1 = require("@nestjs/jwt");
let MerchantService = MerchantService_1 = class MerchantService {
    constructor(merchantModel, userService, authService, emailService, notificationService, nodemailService, jwtService) {
        this.merchantModel = merchantModel;
        this.userService = userService;
        this.authService = authService;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.nodemailService = nodemailService;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(MerchantService_1.name);
        this.emailVerifyRewardPoints = process.env.EMAIL_VERIFICATION_REWARD_POINTS || constants_1.EMAIL_VERIFICATION_REWARD_POINTS;
        this.phoneVerifyRewardPoints = process.env.PHONE_VERIFICATION_REWARD_POINTS || constants_1.PHONE_VERIFICATION_REWARD_POINTS;
    }
    async create(createMerchantDto) {
        const existingMerchant = await this.merchantModel.findOne({
            $or: [
                { email: createMerchantDto.email },
                { phoneNumber: createMerchantDto.phoneNumber }
            ]
        }).exec();
        if (existingMerchant) {
            throw new common_1.ConflictException('A merchant with this email or phone number already exists');
        }
        const hashedPassword = await password_util_1.PasswordUtil.hashPassword(createMerchantDto.password);
        const clientId = (0, uuid_1.v4)();
        const clientKey = token_util_1.TokenUtil.generateToken({ clientId }, '365d');
        const qrCode = await (0, qr_code_util_1.generateQrCode)(clientId);
        const merchantData = {
            ...createMerchantDto,
            password: hashedPassword,
            clientId,
            clientKey,
            qrCode,
            roles: createMerchantDto.roles ?? ['merchant'],
            address: [
                {
                    ghanaPostGPS: createMerchantDto.ghanaPostGPS,
                    street: createMerchantDto.street,
                    city: createMerchantDto.city,
                    state: createMerchantDto.state,
                    zip: createMerchantDto.zip,
                    country: createMerchantDto.country,
                }
            ]
        };
        const createdMerchant = new this.merchantModel(merchantData);
        return createdMerchant.save();
    }
    async merchantLogin(merchant) {
        try {
            const payload = {
                name: merchant._doc.name || merchant._doc.clientId,
                sub: merchant._doc._id,
                roles: ['merchant'],
            };
            const accessToken = this.jwtService.sign(payload, { secret: constants_1.JWT_SECRET });
            const refreshToken = this.authService.generateRefreshToken(payload);
            await this.updateLastLogin(merchant._id);
            return {
                access_token: accessToken,
                refresh_token: refreshToken,
                merchant: {
                    id: merchant._id,
                    clientId: merchant.clientId,
                }
            };
        }
        catch (error) {
            this.logger.error(`Error during merchant login: ${error.message}`);
            throw new Error('Failed to generate merchant tokens');
        }
    }
    async findMerchantById(id) {
        const merchant = await this.merchantModel.findById(id).exec();
        if (!merchant) {
            throw new common_1.NotFoundException(`Merchant with ID "${id}" not found`);
        }
        return merchant;
    }
    async findOneByClientId(clientId) {
        const merchant = await this.merchantModel.findOne({ clientId }).exec();
        if (!merchant) {
            throw new common_1.NotFoundException(`Merchant with clientId "${clientId}" not found`);
        }
        return merchant;
    }
    async update(merchantId, updateMerchantDto) {
        const updateData = {
            ...updateMerchantDto,
            address: [
                {
                    ghanaPostGPS: updateMerchantDto.ghanaPostGPS,
                    street: updateMerchantDto.street,
                    city: updateMerchantDto.city,
                    state: updateMerchantDto.state,
                    zip: updateMerchantDto.zip,
                    country: updateMerchantDto.country
                }
            ]
        };
        if (updateData.password) {
            updateData.password = await password_util_1.PasswordUtil.hashPassword(updateData.password);
        }
        const updatedMerchant = await this.merchantModel.findByIdAndUpdate(merchantId, updateData, { new: true, runValidators: true }).exec();
        if (!updatedMerchant) {
            throw new common_1.NotFoundException(`Merchant with ID "${merchantId}" not found`);
        }
        return updatedMerchant;
    }
    async delete(merchantId) {
        const result = await this.merchantModel.findByIdAndDelete(merchantId).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Merchant with ID "${merchantId}" not found`);
        }
    }
    async updateLastLogin(merchantId) {
        await this.merchantModel.findByIdAndUpdate(merchantId, { lastLogin: new Date() });
    }
    async findAllRegisteredMerchants() {
        const merchants = await this.merchantModel.find().exec();
        const total = merchants.length;
        return { merchants, total };
    }
    async updateRewardPoints(clientId, points) {
        const result = await this.merchantModel.updateOne({ clientId }, { $inc: { rewardPoints: points } });
        if (result.matchedCount === 0) {
            throw new common_1.NotFoundException('Merchant not found');
        }
    }
    async changePassword(clientId, currentPassword, newPassword) {
        const merchant = await this.merchantModel.findOne({ clientId }).select('+password');
        if (!merchant) {
            throw new common_1.NotFoundException('Merchant not found');
        }
        const isPasswordValid = await password_util_1.PasswordUtil.comparePassword(currentPassword, merchant.password);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        if (currentPassword === newPassword) {
            throw new common_1.BadRequestException('New password must be different from the current password');
        }
        const hashedPassword = await password_util_1.PasswordUtil.hashPassword(newPassword);
        await this.merchantModel.updateOne({ clientId }, { $set: { password: hashedPassword } });
    }
    async updateClientToken(clientId, newClientKey) {
        const result = await this.merchantModel.updateOne({ clientId }, { $set: { clientKey: newClientKey } });
        if (result.matchedCount === 0) {
            throw new common_1.NotFoundException('Merchant not found');
        }
        const merchant = await this.merchantModel.findOne({ clientId }, { _id: 0, name: 1, email: 1 });
        if (merchant) {
            await this.emailService.sendMail(merchant.email, 'Merchant client token update', `Your new client token is ${newClientKey}`);
        }
        else {
            throw new common_1.NotFoundException('Merchant not found');
        }
    }
    async trackQRCodeUsage(clientId) {
        const updatedMerchant = await this.merchantModel.findOneAndUpdate({ clientId }, {
            $inc: { qrCodeUsageCount: 1 },
            $set: { lastQRCodeUsage: new Date() }
        }, { new: true, runValidators: true });
        if (!updatedMerchant) {
            throw new common_1.NotFoundException('Merchant not found');
        }
        await this.updateRewardPoints(clientId, constants_1.QR_CODE_SCAN_REWARD_POINTS);
        return updatedMerchant;
    }
    async getQRCodeUsageStats(clientId) {
        const merchant = await this.merchantModel.findOne({ clientId }, 'qrCodeUsageCount lastQRCodeUsage');
        if (!merchant) {
            throw new common_1.NotFoundException('Merchant not found');
        }
        return {
            usageCount: merchant.qrCodeUsageCount || 0,
            lastUsed: merchant.lastQRCodeUsage || null,
        };
    }
    async generateInvitationLink(merchantId) {
        const merchant = await this.merchantModel.findById(merchantId);
        if (!merchant) {
            throw new common_1.NotFoundException('Merchant not found');
        }
        const invitationLink = `${process.env.APP_URL}/merchant-invite/${(0, uuid_1.v4)()}`;
        merchant.invitationLink = invitationLink;
        await merchant.save();
        return invitationLink;
    }
    async trackInvitationLinkUsage(invitationLink) {
        const merchant = await this.merchantModel.findOne({ invitationLink });
        if (!merchant) {
            throw new common_1.NotFoundException('Invalid invitation link');
        }
        const updatedMerchant = await this.merchantModel.findByIdAndUpdate(merchant._id, {
            $inc: { invitationLinkUsageCount: 1 },
            $set: { lastInvitationLinkUsage: new Date() }
        }, { new: true, runValidators: true });
        await this.updateRewardPoints(merchant.clientId, constants_1.MERCHANT_INVITATION_LINK_REWARD_POINTS);
        return updatedMerchant;
    }
    async getInvitationLinkStats(clientId) {
        const merchant = await this.merchantModel.findOne({ clientId }, 'invitationLinkUsageCount lastInvitationLinkUsage');
        if (!merchant) {
            throw new common_1.NotFoundException('Merchant not found');
        }
        return {
            usageCount: merchant.invitationLinkUsageCount || 0,
            lastUsed: merchant.lastInvitationLinkUsage || null,
        };
    }
    async verifyEmail(email, token) {
        const merchant = await this.merchantModel.findOne({ email });
        if (!merchant) {
            throw new common_1.NotFoundException('merchant not found');
        }
        if (merchant.verificationToken !== token) {
            throw new common_1.UnauthorizedException('Invalid verification token');
        }
        if (merchant.emailVerified) {
            return merchant;
        }
        merchant.emailVerified = true;
        merchant.verificationToken = null;
        await merchant.save();
        try {
            await this.nodemailService.sendMail(merchant.email, 'Email Verification Successful', email_templates_1.EmailTemplates.emailVerificationSuccess(merchant.name));
        }
        catch (emailError) {
            this.logger.error(`Failed to send verification success email: ${emailError.message}`);
        }
    }
    async resendVerificationEmail(email) {
        const merchant = await this.merchantModel.findOne({ email });
        if (!merchant) {
            throw new common_1.NotFoundException('merchant not found');
        }
        if (merchant.emailVerified) {
            throw new common_1.BadRequestException('merchant is already verified');
        }
        const verificationToken = (0, uuid_1.v4)();
        merchant.verificationToken = verificationToken;
        merchant.emailVerificationToken = verificationToken;
        merchant.points += Number(this.emailVerifyRewardPoints);
        await merchant.save();
        await this.sendVerificationEmail(merchant, verificationToken);
    }
    async sendVerificationEmail(merchant, verificationToken) {
        const url = `${process.env.DOMAIN_URL}/auth/verify-email/${verificationToken}`;
        const message = `Click the link below to verify your email address: ${url}`;
        await this.emailService.sendMail(merchant.email, 'Verify your email address', message);
    }
};
exports.MerchantService = MerchantService;
exports.MerchantService = MerchantService = MerchantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(merchant_schema_1.Merchant.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_service_1.UserService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => auth_service_1.AuthService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.UserService,
        auth_service_1.AuthService,
        email_service_1.EmailService,
        notification_service_1.NotificationService,
        nodemail_service_1.NodemailService,
        jwt_1.JwtService])
], MerchantService);
//# sourceMappingURL=merchant.service.js.map