import { model, Schema } from '@src/config/database';
import { Document, PopulatedDoc } from 'mongoose';
import { CommentDocument } from '../comment/comment.model';
import { ReactionDocument } from '../reaction/reaction.model';
import { ShareDocument } from '../share/share.model';

export enum Privacy {
  PUBLIC,
  FRIENDS,
  ONLY_ME,
}

export interface Post {
  userId: string;
  createdAt: Date;
  privacy: Privacy;
  content: string;
  reactionIds: string[];
  reactions?: PopulatedDoc<ReactionDocument>[];
  commentIds: string[];
  comments?: PopulatedDoc<CommentDocument>[];
  shareIds: string[];
  shares?: PopulatedDoc<ShareDocument>[];
}

export const PostSchema = new Schema<Post>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  privacy: {
    type: Number,
    enum: Object.values(Privacy),
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  reactionIds: [
    {
      type: [Schema.Types.ObjectId],
      ref: 'Reaction',
    },
  ],
  commentIds: [
    {
      type: [Schema.Types.ObjectId],
      ref: 'Comment',
    },
  ],
  shareIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Share',
    },
  ],
});

PostSchema.virtual('reactions', {
  ref: 'Reaction',
  localField: 'reactionIds',
  foreignField: '_id',
});

PostSchema.virtual('comments', {
  ref: 'Comment',
  localField: 'commentIds',
  foreignField: '_id',
});

PostSchema.virtual('shares', {
  ref: 'Share',
  localField: 'shareIds',
  foreignField: '_id',
});

PostSchema.set('toObject', { virtuals: true });
PostSchema.set('toJSON', { virtuals: true });

export const PostModel = model<Post>('Post', PostSchema);

export type PostDocument = Post & Document<any, any, Post>;

export default PostModel;
