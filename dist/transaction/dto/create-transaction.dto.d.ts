export declare class MonetaryDetailsDto {
    amount: number;
    fee?: number;
    originalAmount?: string;
    currency?: string;
    balance_before?: string;
    balance_after?: string;
    currentBalance?: string;
    deliveredAmount?: any;
    requestedAmount?: any;
    discount: any;
}
export declare class TransactionStatusDto {
    transaction: string;
    service: string;
    payment?: string;
}
export declare class PaymentDetailsDto {
    currency?: string;
    commentary?: string;
    status?: string;
    serviceCode?: string;
    transactionId?: string;
    serviceMessage?: string;
    type?: string;
    operatorTransactionId?: string;
}
export declare class CreateTransactionDto {
    userId: string;
    userName?: string;
    transType: string;
    transId: string;
    recipientNumber?: string;
    operator?: string;
    network?: string;
    retailer?: string;
    expressToken?: string;
    monetary: MonetaryDetailsDto;
    status: TransactionStatusDto;
    payment?: PaymentDetailsDto;
    metadata?: Array<{
        initiatedAt: Date;
        provider: string;
        username: string;
        accountNumber: string;
        lastQueryAt: Date;
        token?: string;
        result?: number;
        'result-text'?: string;
    }>;
    commentary?: string;
    trxn?: string;
    paymentCommentary?: string;
    deliveredAmount?: number;
    requestedAmount?: number;
    operatorTransactionId?: string;
    discount?: number;
    balanceInfo?: {
        oldBalance: number;
        newBalance: number;
        cost: number;
        currencyCode: string;
        currencyName: string;
        updatedAt: Date;
    };
}
