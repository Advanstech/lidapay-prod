import { Schema, Document, Types } from 'mongoose';
export interface IAccount extends Document {
    userId: Types.ObjectId;
    accountId: string;
    balance: number;
    transactions: Array<{
        amount: number;
        type: 'credit' | 'debit' | 'momo' | 'transfer';
        date: Date;
        description?: string;
    }>;
}
declare const AccountSchema: Schema<IAccount, import("mongoose").Model<IAccount, any, any, any, Document<unknown, any, IAccount> & IAccount & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IAccount, Document<unknown, {}, import("mongoose").FlatRecord<IAccount>> & import("mongoose").FlatRecord<IAccount> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export type AccountDocument = IAccount;
export default AccountSchema;
