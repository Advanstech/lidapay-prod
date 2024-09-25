export class CreateAffiliateDto {
    name: string;
    email: string;
    phone: string;
    password: string;
    referralCode: string;
    referredBy?: string;
}