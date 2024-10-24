import { Document } from 'mongoose';
export type TransactionDocument = Transaction & Document;
export declare class Transaction {
    userId: string;
    userName: string;
    retailer?: string;
    transType: string;
    amount: number;
    currency: string;
    currencyName?: string;
    transStatus: string;
    serviceStatus: string;
    serviceCode: string;
    serviceTransId: string;
    serviceMessage?: string;
    referrerClientId?: string;
    transId?: string;
    operator: string;
    recipientNumber: string;
    dataPackage?: string;
    dataCode?: string;
    momoTransType?: string;
    transFee?: number;
    discountApplied?: number;
    pointsEarned?: number;
    pointsRedeemed?: number;
    transactionMessage?: string;
    network?: string;
    trxn?: string;
    fee?: number;
    originalAmount?: string;
    commentary?: string;
    balance_before?: string;
    balance_after?: string;
    currentBalance?: string;
    paymentCurrency?: string;
    paymentCommentary?: string;
    paymentStatus?: string;
    paymentServiceCode?: string;
    paymentTransactionId?: string;
    paymentServiceMessage?: string;
    paymentType?: string;
    expressToken?: string;
    metadata: Array<{
        initiatedAt: Date;
        provider: string;
        username: string;
        accountNumber: string;
        lastQueryAt: Date;
    }>;
    timestamp?: Date;
}
export declare const TransactionSchema: import("mongoose").Schema<Transaction, import("mongoose").Model<Transaction, any, any, any, Document<unknown, any, Transaction> & Transaction & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v?: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Transaction, Document<unknown, {}, import("mongoose").FlatRecord<Transaction>> & import("mongoose").FlatRecord<Transaction> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v?: number;
}>;
