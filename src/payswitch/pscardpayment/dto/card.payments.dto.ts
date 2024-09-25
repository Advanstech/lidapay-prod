export class CardPaymentDto {
    readonly merchantId: string;
    readonly transId: string;
    transType: string;
    readonly serviceName?: string;
    customerName?: string;
    customerEmail?: string;
    clientReference?: string;
    customerMsisdn?: string;
    channel?: string;
    amount?: string;
    description?: string;
    primaryCallbackUrl?: string;
    secondaryCallbackUrl?: string;
    token?: string;
    transStatus?: string;
    transMessage?: string;
    serviceStatus?: string;
    serviceTransId?: string;
    paymentStatus?: string;
    cardHolderName?: string;
    currency?: string;
    expMonth?: string;
    expYear?: string;
    pan?: string;
    cvv?: string;
    otherInfo?: string;
    retailer?: string;
}