import { Model } from 'mongoose';
import { MerchantDocument } from '../schemas/merchant.schema';
export declare class AddMerchantCountryFieldMigration {
    private merchantModel;
    private logger;
    constructor(merchantModel: Model<MerchantDocument>);
    migrate(): Promise<{
        success: boolean;
        updatedCount: number;
    }>;
}
