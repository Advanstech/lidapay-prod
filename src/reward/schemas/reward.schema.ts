import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RewardDocument = Reward & Document;

@Schema({ timestamps: true })
export class Reward {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  points: number;

  @Prop()
  history: Array<{
    date: Date,
    points: number,
    reason: string
  }>;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
