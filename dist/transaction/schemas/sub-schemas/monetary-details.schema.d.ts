export declare class MonetaryDetails {
    amount: number;
    fee: number;
    originalAmount?: string;
    currency?: string;
    balance_before?: string;
    balance_after?: string;
    currentBalance?: string;
    deliveredAmount?: number;
    requestedAmount?: number;
    discount?: number;
}
export declare const MonetaryDetailsSchema: import("mongoose").Schema<MonetaryDetails, import("mongoose").Model<MonetaryDetails, any, any, any, import("mongoose").Document<unknown, any, MonetaryDetails> & MonetaryDetails & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v?: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MonetaryDetails, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<MonetaryDetails>> & import("mongoose").FlatRecord<MonetaryDetails> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v?: number;
}>;
