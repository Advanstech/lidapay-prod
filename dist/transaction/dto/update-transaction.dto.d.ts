interface TransactionStatus {
    service: string;
    payment: string;
    transaction: string;
}
export declare class UpdateTransactionDto {
    status?: TransactionStatus;
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
    expressToken?: string;
    timestamp?: Date;
    lastChecked?: Date;
    metadata?: Record<string, any>;
    queryLastChecked?: Date;
    payment?: {
        serviceCode: string;
        transactionId: string;
        serviceMessage?: string;
        commentary?: string;
        operatorTransactionId?: string;
        status?: string;
        currency?: string;
    };
    commentary?: string;
    deliveredAmount?: number;
    requestedAmount?: number;
}
export {};
