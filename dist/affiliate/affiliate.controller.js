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
var AffiliateController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffiliateController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const affiliate_service_1 = require("./affiliate.service");
const passport_1 = require("@nestjs/passport");
const create_affiliate_dto_1 = require("./dto/create.affiliate.dto");
let AffiliateController = AffiliateController_1 = class AffiliateController {
    constructor(affiliateService) {
        this.affiliateService = affiliateService;
        this.logger = new common_1.Logger(AffiliateController_1.name);
    }
    async createAffiliate(createAffiliateDto, req) {
        this.logger.log(`Creating affiliate for user: ${JSON.stringify(req.user)}`);
        const user = req.user;
        const affiliate = {
            ...createAffiliateDto,
            referredBy: user.userId,
            email: user.email,
            name: user.username,
        };
        return this.affiliateService.createAffiliate(affiliate);
    }
    findAllAffiliates() {
        return this.affiliateService.findAllAffiliates();
    }
    getReferralByCode(code) {
        return this.affiliateService.getReferralByCode(code);
    }
    async getDashboardSummary() {
        return this.affiliateService.getDashboardSummary();
    }
    async triggerCommissionUpdate() {
        await this.affiliateService.updateAffiliateCommissions();
        return { message: 'Commission update triggered successfully' };
    }
};
exports.AffiliateController = AffiliateController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new affiliate' }),
    (0, swagger_1.ApiBody)({
        description: 'Create Affiliate DTO',
        schema: {
            type: 'object',
            properties: {
                referralCode: {
                    type: 'string',
                    description: 'The referral code for the affiliate',
                    example: 'ABC123',
                },
                referredBy: {
                    type: 'string',
                    description: 'The email of the user who referred the affiliate',
                    example: 'user@example.com',
                },
            },
            required: ['referralCode', 'referredBy'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The affiliate has been successfully created.',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_affiliate_dto_1.CreateAffiliateDto, Object]),
    __metadata("design:returntype", Promise)
], AffiliateController.prototype, "createAffiliate", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Get all affiliates' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Affiliates found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AffiliateController.prototype, "findAllAffiliates", null);
__decorate([
    (0, common_1.Get)(':code'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get referral by code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Referral found.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Referral not found.' }),
    (0, swagger_1.ApiParam)({ name: 'code', type: 'string', description: 'Referral code' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AffiliateController.prototype, "getReferralByCode", null);
__decorate([
    (0, common_1.Get)('dashboard/summary'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard summary' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard summary retrieved.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AffiliateController.prototype, "getDashboardSummary", null);
__decorate([
    (0, common_1.Post)('trigger-commission-update'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger commission update' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Commission update triggered successfully.',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden.' }),
    (0, swagger_1.ApiBody)({ description: 'Trigger commission update' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AffiliateController.prototype, "triggerCommissionUpdate", null);
exports.AffiliateController = AffiliateController = AffiliateController_1 = __decorate([
    (0, swagger_1.ApiTags)('Affiliate'),
    (0, common_1.Controller)('api/v1/affiliate'),
    __metadata("design:paramtypes", [affiliate_service_1.AffiliateService])
], AffiliateController);
//# sourceMappingURL=affiliate.controller.js.map