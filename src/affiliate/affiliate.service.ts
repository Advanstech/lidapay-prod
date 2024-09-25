import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Affiliate } from './entities/affiliate.entity';
import { Referral } from './entities/referral.entity';
import { CreateAffiliateDto } from './dto/create.affiliate.dto';

@Injectable()
export class AffiliateService {
  private readonly logger = new Logger(AffiliateService.name);

  constructor(
    @InjectModel(Affiliate.name) private affiliateModel: Model<Affiliate>,
    @InjectModel(Referral.name) private referralModel: Model<Referral>,
  ) {}

  async createAffiliate(createAffiliateDto: CreateAffiliateDto): Promise<Affiliate> {
    if (!createAffiliateDto) {
      throw new Error('createAffiliateDto is null or undefined');
    }

    const createdAffiliate = new this.affiliateModel({
      ...createAffiliateDto,
      referralCode: this.generateReferralCode(),
    });

    try {
      return await createdAffiliate.save();
    } catch (error) {
      this.logger.error(`Error creating affiliate: ${error.message}`);
      throw new BadRequestException(`Error creating affiliate: ${error.message}`);
    }
  }

  // Find all affiliates
  async findAllAffiliates(): Promise<Affiliate[]> {
    return this.affiliateModel.find().exec();
  }

  async getReferralByCode(code: string): Promise<Affiliate> {
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

  async getTopPerformingAffiliates(limit: number = 10) {
    return this.affiliateModel.find().sort({ totalCommission: -1 }).limit(limit).exec();
  }

  async getAverageCommissionPerAffiliate() {
    const result = await this.affiliateModel.aggregate([
      { $group: { _id: null, average: { $avg: '$totalCommission' } } }
    ]).exec();
    return result[0]?.average || 0;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateAffiliateCommissions() {
    this.logger.log('Updating affiliate commissions...');

    const pendingReferrals = await this.referralModel.find({ status: 'pending' }).populate('affiliate').exec();

    for (const referral of pendingReferrals) {
      if (await this.isReferralEligibleForCommission(referral)) {
        referral.status = 'completed';
        // Ensure affiliate is of type Affiliate
        const affiliate = referral.affiliate as unknown as Affiliate; // Cast to unknown first
        affiliate.totalCommission += referral.commission;

        await referral.save();
        await affiliate.save();
      }
    }

    this.logger.log('Affiliate commissions updated successfully');
  }

  private async isReferralEligibleForCommission(referral: Referral): Promise<boolean> {
    // Implement your logic here
    const currentDate = new Date();
    const referralDate = new Date(referral.createdAt);
    referralDate.setDate(referralDate.getDate() + 30); // Assuming 30 days is the eligibility period

    return currentDate <= referralDate;
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}