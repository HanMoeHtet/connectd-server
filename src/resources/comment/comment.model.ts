import { model, Schema } from '@src/config/database';
import { Document, PopulatedDoc } from 'mongoose';
import { ReactionType, ReactionDocument } from '../reaction/reaction.model';
import { ReplyDocument } from '../reply/reply.model';
import { UserDocument } from '../user/user.model';
import { MediaType } from '../post/post.model';

export interface Comment {
  userId: string;
  user: PopulatedDoc<UserDocument>;
  postId: string;
  createdAt: Date;
  content: string;
  media: {
    type: MediaType;
    url: string;
  };
  reactionCounts: Map<ReactionType, number>;
  reactionIds: string[];
  populatedReactions?: PopulatedDoc<ReactionDocument>[];
  reactions: Map<ReactionType, string[]>;
  replyCount: number;
  replyIds: string[];
  replies?: PopulatedDoc<ReplyDocument>[];
}

export const CommentSchema = new Schema<Comment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    content: {
      type: String,
      requred: true,
    },
    media: {
      type: {
        type: String,
        enum: MediaType,
      },
      url: String,
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
    replyCount: {
      type: Number,
      default: 0,
    },
    replyIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Reply',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { id: false }
);

CommentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

CommentSchema.virtual('populatedReactions', {
  ref: 'Reaction',
  localField: 'reactionIds',
  foreignField: '_id',
});

CommentSchema.virtual('replies', {
  ref: 'Reply',
  localField: 'replyIds',
  foreignField: '_id',
});

CommentSchema.set('toObject', { virtuals: true });
CommentSchema.set('toJSON', {
  virtuals: true,
});

export const CommentModel = model<Comment>('Comment', CommentSchema);

export type CommentDocument = Comment & Document<any, any, Comment>;

export default CommentModel;
