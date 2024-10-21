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
var MerchantController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const merchant_service_1 = require("./merchant.service");
const create_merchant_dto_1 = require("./dto/create-merchant.dto");
const update_merchant_dto_1 = require("./dto/update-merchant.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const merchant_schema_1 = require("./schemas/merchant.schema");
const change_password_dto_1 = require("./dto/change-password.dto");
const reward_service_1 = require("../reward/reward.service");
const merchant_invitation_link_dto_1 = require("./dto/merchant-invitation-link.dto");
const merchant_auth_guard_1 = require("../auth/merchant-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const auth_service_1 = require("../auth/auth.service");
let MerchantController = MerchantController_1 = class MerchantController {
    constructor(merchantService, rewardsService, authService) {
        this.merchantService = merchantService;
        this.rewardsService = rewardsService;
        this.authService = authService;
        this.logger = new common_1.Logger(MerchantController_1.name);
    }
    async register(createMerchantDto) {
        console.log(`createMerchantDto ==> ${JSON.stringify(createMerchantDto)}`);
        return this.merchantService.create(createMerchantDto);
    }
    async merchantLogin(loginDto) {
        const merchant = await this.authService.validateMerchant(loginDto.clientId, loginDto.clientKey);
        if (!merchant) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.merchantService.merchantLogin(merchant);
    }
    async findMerchantByClientId(merchantId) {
        this.logger.log(`MERCHANT_ID ==> ${merchantId}`);
        return this.merchantService.findOneByClientId(merchantId);
    }
    async findMerchantById(merchantId) {
        this.logger.log(`MERCHANT_ID ==> ${merchantId}`);
        return this.merchantService.findMerchantById(merchantId);
    }
    async findAllMerchants() {
        return this.merchantService.findAllRegisteredMerchants();
    }
    async update(merchantId, updateMerchantDto) {
        return this.merchantService.update(merchantId, updateMerchantDto);
    }
    async delete(req, merchantId) {
        if (req.user.roles.includes('admin') ||
            req.user.merchantId === merchantId) {
            try {
                await this.merchantService.delete(merchantId);
                return { message: 'Merchant has been successfully removed' };
            }
            catch (error) {
                if (error instanceof common_1.NotFoundException) {
                    throw new common_1.NotFoundException(error.message);
                }
                throw error;
            }
        }
        else {
            throw new common_1.UnauthorizedException('You do not have permission to delete this merchant');
        }
    }
    async getQRCode(clientId) {
        const merchant = await this.merchantService.findOneByClientId(clientId);
        return { qrCode: merchant.qrCode };
    }
    async changePassword(clientId, changePasswordDto) {
        try {
            await this.merchantService.changePassword(clientId, changePasswordDto.currentPassword, changePasswordDto.newPassword);
            return { message: 'Password changed successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw new common_1.NotFoundException(error.message);
            }
            else if (error instanceof common_1.BadRequestException) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async trackQRCodeUsage(clientId) {
        return this.merchantService.trackQRCodeUsage(clientId);
    }
    async getQRCodeUsageStats(clientId) {
        return this.merchantService.getQRCodeUsageStats(clientId);
    }
    async scanQRCode(clientId) {
        await this.merchantService.trackQRCodeUsage(clientId);
        await this.rewardsService.awardQRCodeScanPoints(clientId, 'merchant');
        return { message: 'QR code scanned and points awarded' };
    }
    async generateInvitationLink(req) {
        const merchantId = req.user.merchantId;
        const invitationLink = await this.merchantService.generateInvitationLink(merchantId);
        return { invitationLink };
    }
    async trackInvitationLinkUsage(invitationLink) {
        return this.merchantService.trackInvitationLinkUsage(invitationLink);
    }
    async getInvitationLinkStats(req) {
        const clientId = req.user.merchantId;
        return this.merchantService.getInvitationLinkStats(clientId);
    }
};
exports.MerchantController = MerchantController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new merchant' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The record has been successfully created',
        type: merchant_schema_1.Merchant,
    }),
    (0, swagger_1.ApiBody)({
        description: 'Merchant registration details',
        schema: {
            type: 'object',
            required: ['name', 'email', 'phoneNumber', 'password'],
            properties: {
                name: {
                    type: 'string',
                    description: 'The name of the merchant',
                    example: 'Accra Supermarket',
                },
                email: {
                    type: 'string',
                    description: 'Email address of the merchant',
                    example: 'info@accrasupermarket.com',
                },
                phoneNumber: {
                    type: 'string',
                    description: 'Phone number of the merchant',
                    example: '+233241234567',
                },
                password: {
                    type: 'string',
                    description: 'Password for the merchant account',
                    example: 'securePassword123!',
                },
                street: {
                    type: 'string',
                    description: 'Street address of the merchant',
                    example: '123 Independence Avenue',
                },
                city: {
                    type: 'string',
                    description: 'City of the merchant',
                    example: 'Accra',
                },
                ghanaPostGPS: {
                    type: 'string',
                    description: 'Ghana Post GPS location of the merchant',
                    example: 'GA-123-4567',
                },
                state: {
                    type: 'string',
                    description: 'State or region of the merchant',
                    example: 'Greater Accra',
                },
                zip: {
                    type: 'string',
                    description: 'Zip code of the merchant',
                    example: '00233',
                },
                country: {
                    type: 'string',
                    description: 'Country of the merchant',
                    example: 'Ghana',
                },
                businessType: {
                    type: 'string',
                    description: 'Type of business',
                    example: 'Retail',
                },
                taxId: {
                    type: 'string',
                    description: 'Tax identification number',
                    example: 'GH1234567890',
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_merchant_dto_1.CreateMerchantDto]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Merchant login' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The record has been successfully created',
        type: merchant_schema_1.Merchant,
    }),
    (0, swagger_1.ApiBody)({
        description: 'Merchant login details',
        schema: {
            type: 'object',
            required: ['clientId', 'clientKey'],
            properties: {
                clientId: {
                    type: 'string',
                    description: 'The client ID of the merchant',
                    example: 'accrasupermarket',
                },
                clientKey: {
                    type: 'string',
                    description: 'The client key of the merchant',
                    example: 'securePassword123!',
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "merchantLogin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('client/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Find a merchant by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The found merchant',
        type: merchant_schema_1.Merchant,
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Merchant ID', required: true }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "findMerchantByClientId", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Find a merchant by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The found merchant',
        type: merchant_schema_1.Merchant,
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Merchant ID',
        required: true,
        example: '1234567890',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "findMerchantById", null);
__decorate([
    (0, common_1.UseGuards)(merchant_auth_guard_1.MerchantAuthGuard),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Find all registered merchants' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of merchants',
        type: [merchant_schema_1.Merchant],
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "findAllMerchants", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update a merchant' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The updated merchant',
        type: merchant_schema_1.Merchant,
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Put)('update/:id'),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Merchant ID', required: true }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_merchant_dto_1.UpdateMerchantDto]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a merchant' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Merchant has been successfully removed',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Merchant not found' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Merchant ID', required: true }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "delete", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':clientId/qrcode'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get a merchant QR code' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'QR code of the merchant',
        type: String,
    }),
    (0, swagger_1.ApiParam)({ name: 'clientId', description: 'Client ID', required: true }),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "getQRCode", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':clientId/change-password'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Change merchant password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password changed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Merchant not found' }),
    (0, swagger_1.ApiBody)({
        description: 'Password change details',
        type: change_password_dto_1.ChangePasswordDto,
    }),
    (0, swagger_1.ApiParam)({ name: 'clientId', description: 'Client ID', required: true }),
    __param(0, (0, common_1.Param)('clientId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "changePassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(':clientId/track-qr-usage'),
    (0, swagger_1.ApiOperation)({ summary: 'Track QR code usage for a merchant' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'QR code usage tracked successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Merchant not found' }),
    (0, swagger_1.ApiParam)({ name: 'clientId', description: 'Client ID', required: true }),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "trackQRCodeUsage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(':clientId/qr-usage-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get QR code usage stats for a merchant' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'QR code usage stats retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Merchant not found' }),
    (0, swagger_1.ApiParam)({ name: 'clientId', description: 'Client ID', required: true }),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "getQRCodeUsageStats", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(':clientId/scan-qr'),
    (0, swagger_1.ApiOperation)({ summary: 'Scan QR code' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'QR code scanned and points awarded',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Merchant not found' }),
    (0, swagger_1.ApiParam)({ name: 'clientId', description: 'Client ID', required: true }),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "scanQRCode", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, merchant_auth_guard_1.MerchantAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('generate-invitation-link'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate invitation link' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invitation link generated successfully',
        type: String,
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "generateInvitationLink", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('track-invitation-link/:invitationLink'),
    (0, swagger_1.ApiOperation)({ summary: 'Track invitation link usage' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invitation link usage tracked successfully',
        type: merchant_schema_1.Merchant,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Merchant not found' }),
    (0, swagger_1.ApiParam)({
        name: 'invitationLink',
        description: 'Invitation link',
        required: true,
    }),
    __param(0, (0, common_1.Param)('invitationLink')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "trackInvitationLinkUsage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, merchant_auth_guard_1.MerchantAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('invitation-link-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get invitation link stats' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invitation link stats retrieved successfully',
        type: merchant_invitation_link_dto_1.MerchantInvitationLinkDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Merchant not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "getInvitationLinkStats", null);
exports.MerchantController = MerchantController = MerchantController_1 = __decorate([
    (0, swagger_1.ApiTags)('Merchants'),
    (0, common_1.Controller)('api/v1/merchants'),
    __metadata("design:paramtypes", [merchant_service_1.MerchantService,
        reward_service_1.RewardService,
        auth_service_1.AuthService])
], MerchantController);
//# sourceMappingURL=merchant.controller.js.map