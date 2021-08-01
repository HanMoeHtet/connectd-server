import { model, Schema } from '@src/config/database';
import { Document, PopulatedDoc } from 'mongoose';
import { ReplyDocument } from '../reply/reply.model';

export interface Comment {
  userId: string;
  postId: string;
  createdAt: Date;
  content: string;
  reactionIds: string[];
  replyIds: string[];
  replies: PopulatedDoc<ReplyDocument>[];
}

export const CommentSchema = new Schema<Comment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
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
  replyIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Reply',
    },
  ],
});

CommentSchema.virtual('replies', {
  ref: 'Reply',
  localField: 'replyIds',
  foreignField: '_id',
});

export const CommentModel = model<Comment>('Comment', CommentSchema);

export type CommentDocument = Comment & Document<any, any, Comment>;

export default CommentModel;
