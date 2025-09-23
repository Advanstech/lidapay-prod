export declare class ReloadDataDto {
    userId: string;
    userName: string;
    operatorId: number;
    operatorName?: string;
    amount: number;
    useLocalAmount?: boolean;
    customIdentifier?: string;
    recipientEmail?: string;
    recipientNumber: string;
    recipientCountryCode: string;
    senderNumber: string;
    senderCountryCode: string;
    currency?: string;
    transType?: string;
    transId?: string;
    transStatus?: string;
    network?: string;
    countryCode?: string;
    includeData?: boolean;
    retailer?: string;
    retailerId?: string;
}
