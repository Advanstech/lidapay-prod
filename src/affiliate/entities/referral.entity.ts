import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Referral extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Affiliate', required: true })
  affiliate: Types.ObjectId;

  @Prop({ required: true })
  referredUserId: string;

  @Prop({ required: true, enum: ['pending', 'completed', 'cancelled'] })
  status: string;

  @Prop({ type: Number, default: 0 })
  commission: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);