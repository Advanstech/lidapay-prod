import { Document, Types } from 'mongoose';
export interface User {
    verificationToken?: string;
    phoneNumberVerificationCode?: string;
}
export interface InvitationLink {
    link: string;
    createdAt: Date;
    lastUsed: Date | null;
    usageCount: number;
    pointsEarned: number;
}
export type UserDocument = User & Document;
export declare class User extends Document {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    phoneNumber: string;
    gravatar: string;
    roles: string[];
    qrCode: string;
    points: number;
    status: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    verificationToken?: string;
    emailVerificationToken?: string;
    phoneNumberVerificationCode?: string;
    qrCodeUsageCount: number;
    lastQRCodeUsage: Date;
    invitationLink: string;
    invitationLinkUsageCount: number;
    lastInvitationLinkUsage: Date;
    invitationLinks: InvitationLink[];
    totalPointsEarned: number;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
    lidapayAccount: Types.ObjectId;
    wallet: Types.ObjectId;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & Required<{
    _id: unknown;
}> & {
    __v?: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & Required<{
    _id: unknown;
}> & {
    __v?: number;
}>;
