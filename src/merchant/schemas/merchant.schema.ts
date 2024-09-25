import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MerchantDocument = Merchant & Document;

@Schema()
export class Merchant extends Document {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  phoneNumber: string;
  @Prop({ required: true, unique: true })
  clientId: string;
  @Prop({ required: true })
  clientKey: string;
  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  qrCode: string;

  @Prop({ default: 0 })
  rewardPoints: number;

  @Prop({ default: ['merchant'] })
  roles: string[];

  @Prop()
  address?: Array<{
    ghanaPostGPS: string,
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string,
  }>;

  @Prop({ default: false })
  emailVerified?: boolean;
  @Prop()
  verificationToken?: string; // Add this line
  @Prop()
  emailVerificationToken?: string;

  @Prop({ default: 0 })
  loginCount?: number;
  @Prop()
  lastLogin: Date;

  @Prop({ default: 0 })
  points?: number;

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

  @Prop({ type: String, required: false })
  taxId: string;

  @Prop({ default: Date.now() })
  createdAt: Date;
  @Prop({ default: Date.now() })
  updatedAt: Date;

  // Other properties...
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);
