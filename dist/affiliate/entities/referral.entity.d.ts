import { Document, Types } from 'mongoose';
export declare class Referral extends Document {
    affiliate: Types.ObjectId;
    referredUserId: string;
    status: string;
    commission: number;
    createdAt: Date;
}
export declare const ReferralSchema: import("mongoose").Schema<Referral, import("mongoose").Model<Referral, any, any, any, Document<unknown, any, Referral> & Referral & Required<{
    _id: unknown;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Referral, Document<unknown, {}, import("mongoose").FlatRecord<Referral>> & import("mongoose").FlatRecord<Referral> & Required<{
    _id: unknown;
}>>;
