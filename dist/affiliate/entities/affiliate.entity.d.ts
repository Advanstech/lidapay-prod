import { Document, Types } from 'mongoose';
export declare class Affiliate extends Document {
    name: string;
    email: string;
    referralCode: string;
    referredBy: string;
    totalCommission: number;
    referrals: Types.ObjectId[];
}
export declare const AffiliateSchema: import("mongoose").Schema<Affiliate, import("mongoose").Model<Affiliate, any, any, any, Document<unknown, any, Affiliate> & Affiliate & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Affiliate, Document<unknown, {}, import("mongoose").FlatRecord<Affiliate>> & import("mongoose").FlatRecord<Affiliate> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
