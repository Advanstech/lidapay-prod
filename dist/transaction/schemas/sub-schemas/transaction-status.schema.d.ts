export declare class TransactionStatus {
    transaction: string;
    service: string;
    payment?: string;
}
export declare const TransactionStatusSchema: import("mongoose").Schema<TransactionStatus, import("mongoose").Model<TransactionStatus, any, any, any, import("mongoose").Document<unknown, any, TransactionStatus> & TransactionStatus & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v?: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TransactionStatus, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<TransactionStatus>> & import("mongoose").FlatRecord<TransactionStatus> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v?: number;
}>;
