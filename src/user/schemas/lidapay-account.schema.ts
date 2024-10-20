import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema'; // Import the User schema

export interface LidapayAccount extends Document {
  balance: number; // Account balance
  accountNumber: string; // Account number or identifier
}

export type LidapayAccountDocument = LidapayAccount & Document;

@Schema()
export class LidapayAccount extends Document {
  @Prop({ required: true })
  accountNumber: string; // Unique account number
  @Prop({ default: 0 })
  balance: number; // Account balance
  @Prop({ default: Date.now })
  createdAt: Date; // Date of account creation
  @Prop({ default: null })
  lastTransactionDate: Date; // Date of the last transaction
  // Linking to the User schema
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; // Reference to the user who owns this account
}

export const LidapayAccountSchema = SchemaFactory.createForClass(LidapayAccount);
