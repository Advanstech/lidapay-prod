import { Document, Types } from 'mongoose';
export interface MobileMoneyAccount {
    mobileMoneyAccounts: string[];
    cardDetails: string[];
    provider: string;
    phoneNumber: string;
    balance: number;
    lastUsed: Date | null;
}
export interface CardDetails {
    cardType: string;
    cardNumber: string;
    expiryDate: Date;
    balance: number;
    lastUsed: Date | null;
}
export type WalletDocument = Wallet & Document;
export declare class Wallet extends Document {
    user: Types.ObjectId;
    mobileMoneyAccounts: MobileMoneyAccount[];
    cardDetails: CardDetails[];
    totalBalance: number;
    transactionHistory: {
        transactionId: string;
        amount: number;
        type: string;
        date: Date;
        status: string;
        source?: string;
    }[];
    totalUsageCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WalletSchema: import("mongoose").Schema<Wallet, import("mongoose").Model<Wallet, any, any, any, Document<unknown, any, Wallet> & Wallet & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Wallet, Document<unknown, {}, import("mongoose").FlatRecord<Wallet>> & import("mongoose").FlatRecord<Wallet> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
