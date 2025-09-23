export class BuyDataDto {
    operatorId: number;
    operatorName?: string;
    amount: number;
    recipientEmail?: string;
    recipientNumber: string;
    recipientCountryCode: string; // e.g. GH
    senderNumber: string;
    senderCountryCode: string; // e.g. CA
    currency?: string; // e.g. GHS or NGN when using sender currency
    userId: string;
    userName: string;
    countryCode: string;
    includeData: boolean;
}
