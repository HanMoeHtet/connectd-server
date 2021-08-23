import { model, Schema } from '@src/config/database.config';
import { Document, PopulatedDoc } from 'mongoose';
import { UserDocument } from '../user/user.model';

export enum ReactionType {
  LIKE = 'LIKE',
  FAVORITE = 'FAVORITE',
  SATISFIED = 'SATISFIED',
  DISSATISFIED = 'DISSATISFIED',
}

export enum ReactionSourceType {
  POST = 'Post',
  COMMENT = 'Comment',
  REPLY = 'Reply',
}

export interface Reaction {
  userId: string;
  user: PopulatedDoc<UserDocument>;
  sourceType: ReactionSourceType;
  sourceId: string;
  type: ReactionType;
  createdAt: Date;
}

const ReactionSchema = new Schema<Reaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sourceType: {
      type: String,
      required: true,
      enum: Object.values(ReactionSourceType),
    },
    sourceId: {
      type: Schema.Types.ObjectId,
      refPath: 'sourceType',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ReactionType),
      requred: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { id: false }
);

ReactionSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

ReactionSchema.set('toObject', { virtuals: true });
ReactionSchema.set('toJSON', {
  virtuals: true,
});

export const ReactionModel = model<Reaction>('Reaction', ReactionSchema);

export type ReactionDocument = Reaction & Document<any, any, Reaction>;

export default ReactionModel;
