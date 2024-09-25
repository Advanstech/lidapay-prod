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
var AffiliateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffiliateService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const schedule_1 = require("@nestjs/schedule");
const affiliate_entity_1 = require("./entities/affiliate.entity");
const referral_entity_1 = require("./entities/referral.entity");
let AffiliateService = AffiliateService_1 = class AffiliateService {
    constructor(affiliateModel, referralModel) {
        this.affiliateModel = affiliateModel;
        this.referralModel = referralModel;
        this.logger = new common_1.Logger(AffiliateService_1.name);
    }
    async createAffiliate(createAffiliateDto) {
        if (!createAffiliateDto) {
            throw new Error('createAffiliateDto is null or undefined');
        }
        const createdAffiliate = new this.affiliateModel({
            ...createAffiliateDto,
            referralCode: this.generateReferralCode(),
        });
        try {
            return await createdAffiliate.save();
        }
        catch (error) {
            this.logger.error(`Error creating affiliate: ${error.message}`);
            throw new common_1.BadRequestException(`Error creating affiliate: ${error.message}`);
        }
    }
    async findAllAffiliates() {
        return this.affiliateModel.find().exec();
    }
    async getReferralByCode(code) {
        return this.affiliateModel.findOne({ referralCode: code }).exec();
    }
    async getDashboardSummary() {
        const [totalAffiliates, totalReferrals, totalCommissionResult] = await Promise.all([
            this.affiliateModel.countDocuments().exec(),
            this.referralModel.countDocuments().exec(),
            this.affiliateModel.aggregate([
                { $group: { _id: null, total: { $sum: '$totalCommission' } } }
            ]).exec()
        ]);
        const totalCommission = totalCommissionResult[0]?.total || 0;
        return {
            totalAffiliates,
            totalReferrals,
            totalCommission,
        };
    }
    async getTopPerformingAffiliates(limit = 10) {
        return this.affiliateModel.find().sort({ totalCommission: -1 }).limit(limit).exec();
    }
    async getAverageCommissionPerAffiliate() {
        const result = await this.affiliateModel.aggregate([
            { $group: { _id: null, average: { $avg: '$totalCommission' } } }
        ]).exec();
        return result[0]?.average || 0;
    }
    async updateAffiliateCommissions() {
        this.logger.log('Updating affiliate commissions...');
        const pendingReferrals = await this.referralModel.find({ status: 'pending' }).populate('affiliate').exec();
        for (const referral of pendingReferrals) {
            if (await this.isReferralEligibleForCommission(referral)) {
                referral.status = 'completed';
                const affiliate = referral.affiliate;
                affiliate.totalCommission += referral.commission;
                await referral.save();
                await affiliate.save();
            }
        }
        this.logger.log('Affiliate commissions updated successfully');
    }
    async isReferralEligibleForCommission(referral) {
        const currentDate = new Date();
        const referralDate = new Date(referral.createdAt);
        referralDate.setDate(referralDate.getDate() + 30);
        return currentDate <= referralDate;
    }
    generateReferralCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
};
exports.AffiliateService = AffiliateService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AffiliateService.prototype, "updateAffiliateCommissions", null);
exports.AffiliateService = AffiliateService = AffiliateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(affiliate_entity_1.Affiliate.name)),
    __param(1, (0, mongoose_1.InjectModel)(referral_entity_1.Referral.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], AffiliateService);
//# sourceMappingURL=affiliate.service.js.map