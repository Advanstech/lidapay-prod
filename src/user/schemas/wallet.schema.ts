import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface MobileMoneyAccount {
  mobileMoneyAccounts: string[]; // Array of mobile money account identifiers
  cardDetails: string[]; // Array of card details
  provider: string; // E.g., MTN, Airtel
  phoneNumber: string;
  balance: number;
  lastUsed: Date | null;
}

export interface CardDetails {
  cardType: string; // E.g., "Debit", "Credit"
  cardNumber: string;
  expiryDate: Date;
  balance: number;
  lastUsed: Date | null;
}

export type WalletDocument = Wallet & Document;

@Schema()
export class  Wallet extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; // Link to the User schema
  @Prop({ default: [] })
  mobileMoneyAccounts: MobileMoneyAccount[]; // Holds mobile money account details
  @Prop({ default: [] })
  cardDetails: CardDetails[]; // Holds debit/credit card details
  @Prop({ default: 0 })
  totalBalance: number; // Sum of balances from all accounts/cards
  @Prop({ default: [] })
  transactionHistory: {
    transactionId: string;
    amount: number;
    type: string; // E.g., "Deposit", "Withdrawal", "Transfer"
    date: Date;
    status: string; // E.g., "Completed", "Failed"
    source?: string; // E.g., mobile money, card
  }[];
  @Prop({ default: 0 })
  totalUsageCount: number; // Tracks the number of transactions
  @Prop({ default: Date.now() })
  createdAt: Date;
  @Prop({ default: Date.now() })
  updatedAt: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
