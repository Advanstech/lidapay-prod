import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface User {
  // ... other fields ...
  verificationToken?: string; // Add this line
  phoneNumberVerificationCode?: string; // Add this line
}
export interface InvitationLink {
  link: string;
  createdAt: Date;
  lastUsed: Date | null;
  usageCount: number;
  pointsEarned: number;
}

export type UserDocument = User & Document; // Ensure this line exists

@Schema()
export class User extends Document {
  @Prop({ unique: true })
  email: string;

  @Prop({ unique: true })
  username: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  gravatar: string;

  @Prop({ required: true, default: 'USER' })
  roles: string[];

  @Prop()
  qrCode: string; // For agents/merchants

  @Prop()
  points: number; // Reward points

  @Prop({ required: true, default: 'ACTIVE' })
  status: string;

  @Prop({ required: false, default: false })
  emailVerified: boolean;

  @Prop({ required: false, default: false })
  phoneVerified: boolean;

  @Prop()
  verificationToken?: string; // Added this line

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  phoneNumberVerificationCode?: string; // Added this line

  @Prop({ default: 0 })
  qrCodeUsageCount: number;

  @Prop()
  lastQRCodeUsage: Date;

  @Prop({ default: '' })
  invitationLink: string;

  @Prop({ default: 0 })
  invitationLinkUsageCount: number;

  @Prop()
  lastInvitationLinkUsage: Date;

  @Prop({ default: [] })
  invitationLinks: InvitationLink[];

  @Prop({ default: 0 })
  totalPointsEarned: number;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ default: Date.now() })
  updatedAt: Date;

  // Linking to LidapayAccount schema
  @Prop({ type: Types.ObjectId, ref: 'LidapayAccount', required: false })
  lidapayAccount: Types.ObjectId; // Reference to the user's Lidapay account

  // Linking to Wallet schema
  @Prop({ type: Types.ObjectId, ref: 'Wallet', required: false })
  wallet: Types.ObjectId; // Reference to the user's wallet
}

export const UserSchema = SchemaFactory.createForClass(User);
