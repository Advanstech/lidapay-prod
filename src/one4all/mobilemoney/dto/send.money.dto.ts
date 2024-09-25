export class SendMoneyDto {
    readonly apiKey?: string;
    readonly apiSecret?: string;
    readonly transId?: string;
    transType?: string;
    readonly serviceName?: string;
    customerName: string;
    customerEmail: string;
    clientReference: string;
    recipientMsisdn: string;
    network: string;
    amount: string;
    description?: string;
    primaryCallbackUrl?: string;
    secondaryCallbackUrl?: string;
    token?: string;
    transStatus?: string;
    transMessage?: string;
    serviceStatus?: string;
    serviceTransId?: string;
    paymentStatus?: string;
    otherInfo?: string;
    retailer?: string;
}