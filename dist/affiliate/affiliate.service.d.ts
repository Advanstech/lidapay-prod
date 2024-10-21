import { Model } from 'mongoose';
import { Affiliate } from './entities/affiliate.entity';
import { Referral } from './entities/referral.entity';
import { CreateAffiliateDto } from './dto/create.affiliate.dto';
export declare class AffiliateService {
    private affiliateModel;
    private referralModel;
    private readonly logger;
    constructor(affiliateModel: Model<Affiliate>, referralModel: Model<Referral>);
    createAffiliate(createAffiliateDto: CreateAffiliateDto): Promise<Affiliate>;
    findAllAffiliates(): Promise<Affiliate[]>;
    getReferralByCode(code: string): Promise<Affiliate>;
    getDashboardSummary(): Promise<{
        totalAffiliates: number;
        totalReferrals: number;
        totalCommission: any;
    }>;
    getTopPerformingAffiliates(limit?: number): Promise<(import("mongoose").Document<unknown, {}, Affiliate> & Affiliate & Required<{
        _id: unknown;
    }> & {
        __v?: number;
    })[]>;
    getAverageCommissionPerAffiliate(): Promise<any>;
    updateAffiliateCommissions(): Promise<void>;
    private isReferralEligibleForCommission;
    private generateReferralCode;
}
