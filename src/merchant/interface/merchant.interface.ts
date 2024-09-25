export interface Merchant {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    zip: string;
}

export interface MerchantInvitationLink {
    _id?: string;
    merchantId?: string;
    invitationLink?: string;
    usageCount?: number;
    lastUsed?: Date | null;  
}