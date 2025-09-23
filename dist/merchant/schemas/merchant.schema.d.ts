import { Document } from 'mongoose';
export type MerchantDocument = Merchant & Document;
export declare class Merchant extends Document {
    name: string;
    email: string;
    phoneNumber: string;
    clientId: string;
    clientKey: string;
    password: string;
    qrCode: string;
    rewardPoints: number;
    roles: string[];
    address?: Array<{
        ghanaPostGPS: string;
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    }>;
    emailVerified?: boolean;
    verificationToken?: string;
    emailVerificationToken?: string;
    loginCount?: number;
    lastLogin: Date;
    points?: number;
    qrCodeUsageCount: number;
    lastQRCodeUsage: Date;
    invitationLink: string;
    invitationLinkUsageCount: number;
    lastInvitationLinkUsage: Date;
    taxId: string;
    country: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MerchantSchema: import("mongoose").Schema<Merchant, import("mongoose").Model<Merchant, any, any, any, Document<unknown, any, Merchant> & Merchant & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Merchant, Document<unknown, {}, import("mongoose").FlatRecord<Merchant>> & import("mongoose").FlatRecord<Merchant> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
