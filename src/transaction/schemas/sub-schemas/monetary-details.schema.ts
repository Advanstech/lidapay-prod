import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class MonetaryDetails {
    @Prop({ required: true })
    amount: number; // This should be the requested amount
    @Prop({ default: 0 })
    fee: number; // Fee associated with the transaction
    @Prop()
    originalAmount?: string; // Original amount if applicable
    @Prop({ default: 'GHS' })
    currency?: string;
    @Prop()
    balance_before?: string;
    @Prop()
    balance_after?: string;
    @Prop()
    currentBalance?: string;
    @Prop()
    deliveredAmount?: number;
    @Prop()
    requestedAmount?: number;
    @Prop()
    discount?: number;
}

export const MonetaryDetailsSchema = SchemaFactory.createForClass(MonetaryDetails);