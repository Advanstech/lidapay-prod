import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PaymentDetails, PaymentDetailsSchema } from './sub-schemas/payment-details.schema';
import { MonetaryDetails, MonetaryDetailsSchema } from './sub-schemas/monetary-details.schema';
import { TransactionStatus, TransactionStatusSchema } from './sub-schemas/transaction-status.schema';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: false })
  userName: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true })
  transType: string;

  @Prop({ required: true })
  transId: string;

  @Prop()
  trxn?: string;

  @Prop()
  recipientNumber?: string;

  @Prop()
  operator?: string;

  @Prop()
  network?: string;

  @Prop()
  retailer?: string;

  @Prop()
  expressToken?: string;

  @Prop({ type: MonetaryDetailsSchema }) // Use the schema reference
  monetary: MonetaryDetails;

  @Prop({ type: TransactionStatusSchema }) // Use the schema reference
  status: TransactionStatus;

  @Prop({ type: PaymentDetailsSchema }) // Use the schema reference
  payment: PaymentDetails;

  @Prop()
  metadata: Array<{
    initiatedAt: Date,
    provider: string,
    username: string,
    accountNumber: string,
    lastQueryAt: Date
  }>;

  @Prop()
  commentary?: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop()
  queryLastChecked?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Add indexes
TransactionSchema.index({ userId: 1, transType: 1 });
TransactionSchema.index({ transId: 1 }, { unique: true });
TransactionSchema.index({ trxn: 1 }, { sparse: true });
TransactionSchema.index({ timestamp: -1 });