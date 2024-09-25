export declare class TransferMobileMoneyDto {
    readonly merchantId?: string;
    readonly userId?: string;
    readonly userName?: string;
    readonly transId?: string;
    readonly transType?: string;
    readonly serviceName: string;
    recipientName: string;
    customerEmail: string;
    clientReference: string;
    recipientMsisdn: string;
    channel: string;
    amount: string;
    description: string;
    transStatus?: string;
    transMessage?: string;
    serviceStatus?: string;
    serviceTransId?: string;
    paymentStatus?: string;
    otherInfo?: string;
    currency?: string;
    r_switch?: string;
    processing_code?: string;
    transaction_id?: string;
    subscriber_number?: string;
    desc?: string;
    reason?: string;
    retailer?: string;
}
