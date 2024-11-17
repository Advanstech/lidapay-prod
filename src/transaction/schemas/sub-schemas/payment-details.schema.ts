import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class PaymentDetails {
  @Prop()
  type: string;
  @Prop()
  currency: string;
  @Prop()
  commentary?: string;
  @Prop()
  status: string;
  @Prop()
  serviceCode?: string;
  @Prop()
  transactionId: string;
  @Prop()
  serviceMessage?: string;
  @Prop()
  operatorTransactionId?: string; 
}

export const PaymentDetailsSchema = SchemaFactory.createForClass(PaymentDetails);