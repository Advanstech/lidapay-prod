import { Document } from 'mongoose';
import { PaymentDetails } from './sub-schemas/payment-details.schema';
import { MonetaryDetails } from './sub-schemas/monetary-details.schema';
import { TransactionStatus } from './sub-schemas/transaction-status.schema';
export type TransactionDocument = Transaction & Document;
export declare class Transaction {
    userId: string;
    userName: string;
    firstName?: string;
    lastName?: string;
    transType: string;
    transId: string;
    trxn?: string;
    recipientNumber?: string;
    operator?: string;
    network?: string;
    retailer?: string;
    expressToken?: string;
    monetary: MonetaryDetails;
    status: TransactionStatus;
    payment: PaymentDetails;
    metadata: Array<{
        initiatedAt: Date;
        provider: string;
        username: string;
        accountNumber: string;
        lastQueryAt: Date;
    }>;
    commentary?: string;
    timestamp: Date;
    queryLastChecked?: Date;
}
export declare const TransactionSchema: import("mongoose").Schema<Transaction, import("mongoose").Model<Transaction, any, any, any, Document<unknown, any, Transaction> & Transaction & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Transaction, Document<unknown, {}, import("mongoose").FlatRecord<Transaction>> & import("mongoose").FlatRecord<Transaction> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
