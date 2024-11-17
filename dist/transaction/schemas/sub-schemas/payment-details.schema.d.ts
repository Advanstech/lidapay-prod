export declare class PaymentDetails {
    type: string;
    currency: string;
    commentary?: string;
    status: string;
    serviceCode?: string;
    transactionId: string;
    serviceMessage?: string;
    operatorTransactionId?: string;
}
export declare const PaymentDetailsSchema: import("mongoose").Schema<PaymentDetails, import("mongoose").Model<PaymentDetails, any, any, any, import("mongoose").Document<unknown, any, PaymentDetails> & PaymentDetails & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v?: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PaymentDetails, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<PaymentDetails>> & import("mongoose").FlatRecord<PaymentDetails> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v?: number;
}>;
