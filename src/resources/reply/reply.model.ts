import { model, Schema } from '@src/config/database';
import { Document, PopulatedDoc } from 'mongoose';
import { ReactionType, ReactionDocument } from '../reaction/reaction.model';
import { UserDocument } from '../user/user.model';

export interface Reply {
  userId: string;
  user: PopulatedDoc<UserDocument>;
  commentId: string;
  createdAt: Date;
  content: string;
  reactionCounts: Map<ReactionType, number>;
  reactionIds: string[];
  populatedReactions?: PopulatedDoc<ReactionDocument>[];
  reactions: Map<ReactionType, string[]>;
}

export const ReplySchema = new Schema<Reply>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  commentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  },
  content: {
    type: String,
    requred: true,
  },
  reactionCounts: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  reactions: {
    type: Map,
    of: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Reaction',
      },
    ],
    default: new Map(),
  },
  reactionIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Reaction',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ReplySchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

ReplySchema.virtual('populatedReactions', {
  ref: 'Reaction',
  localField: 'reactionIds',
  foreignField: '_id',
});

ReplySchema.set('toObject', { virtuals: true });
ReplySchema.set('toJSON', {
  virtuals: true,
});

export const ReplyModel = model<Reply>('Reply', ReplySchema);

export type ReplyDocument = Reply & Document<any, any, Reply>;

export default ReplyModel;
