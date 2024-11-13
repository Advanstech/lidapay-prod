import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class MonetaryDetails {
  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ type: Number })
  fee?: number;

  @Prop()
  originalAmount?: string;

  @Prop({ default: 'GHS' })
  currency: string;

  @Prop()
  balance_before?: string;

  @Prop()
  balance_after?: string;

  @Prop()
  currentBalance?: string;
} 