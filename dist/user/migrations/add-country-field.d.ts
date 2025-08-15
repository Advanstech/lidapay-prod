import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
export declare class AddCountryFieldMigration {
    private userModel;
    private logger;
    constructor(userModel: Model<UserDocument>);
    migrate(): Promise<{
        success: boolean;
        updatedCount: number;
    }>;
}
