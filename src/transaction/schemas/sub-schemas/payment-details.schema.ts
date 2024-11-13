import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class PaymentDetails {
  @Prop()
  currency?: string;

  @Prop()
  commentary?: string;

  @Prop()
  status?: string;

  @Prop()
  serviceCode?: string;

  @Prop()
  transactionId?: string;

  @Prop()
  serviceMessage?: string;

  @Prop()
  type?: string;
} 