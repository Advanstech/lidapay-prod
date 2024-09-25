import { Document } from 'mongoose';
export type RewardDocument = Reward & Document;
export declare class Reward {
    userId: string;
    points: number;
    history: Array<{
        date: Date;
        points: number;
        reason: string;
    }>;
}
export declare const RewardSchema: import("mongoose").Schema<Reward, import("mongoose").Model<Reward, any, any, any, Document<unknown, any, Reward> & Reward & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Reward, Document<unknown, {}, import("mongoose").FlatRecord<Reward>> & import("mongoose").FlatRecord<Reward> & {
    _id: import("mongoose").Types.ObjectId;
}>;
