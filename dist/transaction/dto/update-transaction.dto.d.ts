export declare class UpdateTransactionDto {
    readonly status?: string;
    transMessage?: string;
    transStatus?: string;
    balance_before?: number;
    balance_after?: number;
    amount?: number;
    transType?: string;
    phoneNumber?: string;
    operator?: string;
    transactionId?: string;
    serviceStatus?: string;
    serviceMessage?: string;
    serviceCode?: string;
    serviceTransId?: string;
    recipientNumber?: string;
    details?: Record<string, any>;
    paymentType?: string;
    paymentCurrency?: string;
    paymentCommentary?: string;
    paymentStatus?: string;
    paymentServiceCode?: string;
    paymentTransactionId?: string;
    paymentServiceMessage?: string;
    curency?: string;
    currencyName?: string;
    timestamp?: Date;
}
