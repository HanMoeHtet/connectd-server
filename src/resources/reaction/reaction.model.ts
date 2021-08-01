import { model, Schema } from '@src/config/database';
import { Document } from 'mongoose';

export enum ReactionType {
  LIKE,
  FAVORITE,
  SATISFIED,
  DISSATISFIED,
}

export interface Reaction {
  userId: string;
  type: ReactionType;
  createdAt: Date;
}

const ReactionSchema = new Schema<Reaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: Number,
    enum: Object.values(ReactionType),
    requred: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const ReactionModel = model<Reaction>('Reaction', ReactionSchema);

export type ReactionDocument = Reaction & Document<any, any, Reaction>;

export default ReactionModel;
