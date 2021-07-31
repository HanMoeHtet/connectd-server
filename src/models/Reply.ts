import { model, Schema } from '@src/config/database';
import { Document } from 'mongoose';

export interface Reply {
  userId: string;
  commentId: string;
  createdAt: Date;
  content: string;
  reactionIds: string[];
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  content: {
    type: String,
    requred: true,
  },
  reactionIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Reaction',
    },
  ],
});

export const ReplyModel = model<Reply>('Reply', ReplySchema);

export type ReplyDocument = Reply & Document<any, any, Reply>;

export default ReplyModel;
