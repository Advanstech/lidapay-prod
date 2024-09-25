import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Affiliate extends Document {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true, unique: true })
  referralCode: string;
  @Prop({ required: false })
  referredBy: string;

  @Prop({ default: 0 })
  totalCommission: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Referral' }] })
  referrals: Types.ObjectId[];
}

export const AffiliateSchema = SchemaFactory.createForClass(Affiliate);