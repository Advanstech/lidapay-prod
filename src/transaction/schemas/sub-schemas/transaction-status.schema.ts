import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class TransactionStatus {
  @Prop({ 
    required: true, 
    enum: ['pending', 'completed', 'failed', 'success', 'approved'] 
  })
  transaction: string;

  @Prop({ 
    required: true, 
    enum: [
      'pending',
      'inprogress',
      'refunded',
      'reversed',
      'cancelled',
      'completed',
      'failed',
      'success',
      'approved',
      'declined',
      'error'
    ] 
  })
  service: string;

  @Prop()
  payment?: string;
} 