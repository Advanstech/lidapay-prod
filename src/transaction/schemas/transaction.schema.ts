import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: false })
  userName: string;
  @Prop()
  firstName?:string;
  @Prop()
  lastName?: string;
  @Prop()
  retailer?: string;
  @Prop({ required: true })
  transType: string;

  @Prop({ required: true, type: Number }) // Specify the type here
  amount: number; // Change 'any' to 'number'

  @Prop({ required: false })
  currency: string;
  @Prop({ required: false })
  currencyName?: string;

  @Prop({ required: true, enum: ['pending', 'completed', 'failed', 'success', 'approved' ] })
  transStatus: string;
  @Prop({ required: true, enum: ['pending', 'inprogress','refunded', 'reversed', 'cancelled', 'completed', 'failed', 'success', 'approved' ] })
  serviceStatus: string;
  @Prop({ required: false })
  serviceCode: string;
  @Prop({ required: false })
  serviceTransId: string;
  @Prop({ required: false })
  serviceMessage?: string;

  @Prop()
  referrerClientId?: string;
  @Prop({ required: false })
  transId?: string;
  @Prop({ required: false })
  operator: string;
  @Prop()
  recipientNumber: string;
  @Prop()
  dataPackage?: string; // For internet data transactions
  @Prop()
  dataCode?: string; // For internet data transactions
  @Prop()
  momoTransType?: string; // For mobile money transactions (e.g., 'send', 'receive', 'withdraw')
  @Prop()
  transFee?: number;
  @Prop()
  discountApplied?: number;
  @Prop()
  pointsEarned?: number;
  @Prop()
  pointsRedeemed?: number;
  @Prop()
  transactionMessage?: string;
  @Prop()
  network?: string; // 0, 1, 2, 3, 4, 5, 6
  @Prop()
  trxn?: string; // Added from airtime top-up context
  @Prop()
  fee?: number; // Added from airtime top-up context
  @Prop()
  originalAmount?: string; // Added from airtime top-up context
  @Prop()
  commentary?: string; // Added from airtime top-up context

  @Prop()
  balance_before?: string; // Added from airtime top-up context
  @Prop()
  balance_after?: string; // Added from airtime top-up context
  @Prop()
  currentBalance?: string; // Added from airtime top-up context

  @Prop()
  paymentCurrency?: string; // Added from payswitch context 
  @Prop()
  paymentCommentary?: string; // Added from payswitch context 
  @Prop()
  paymentStatus?: string; // Added from payswitch context  
  @Prop()
  paymentServiceCode?: string; // Added from payswitch context  
  @Prop()
  paymentTransactionId?: string; // Added from payswitch context  
  @Prop()
  paymentServiceMessage?: string; // Added from payswitch context  
  @Prop()
  paymentType?: string; // Added from payswitch context  
  @Prop()
  expressToken?: string;
  @Prop()
  metadata: Array<{
    initiatedAt: Date,
    provider: string,
    username: string,
    accountNumber: string,
    lastQueryAt: Date
  }>;
  @Prop({ default: Date.now })
  timestamp?: Date;
  
}
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
