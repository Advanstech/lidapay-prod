export class CreateReloadlyDto {
    readonly phoneNumber: string;
    readonly amount: number;
    readonly currency: string;
    readonly transactionId: string;
    countryCode: string;
    isoCode: string;
    retailer?: string;
}