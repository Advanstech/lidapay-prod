import { AffiliateService } from './affiliate.service';
import { CreateAffiliateDto } from './dto/create.affiliate.dto';
export declare class AffiliateController {
    private readonly affiliateService;
    private readonly logger;
    constructor(affiliateService: AffiliateService);
    createAffiliate(createAffiliateDto: CreateAffiliateDto, req: any): Promise<import("./entities/affiliate.entity").Affiliate>;
    findAllAffiliates(): Promise<import("./entities/affiliate.entity").Affiliate[]>;
    getReferralByCode(code: string): Promise<import("./entities/affiliate.entity").Affiliate>;
    getDashboardSummary(): Promise<{
        totalAffiliates: number;
        totalReferrals: number;
        totalCommission: any;
    }>;
    triggerCommissionUpdate(): Promise<{
        message: string;
    }>;
}
