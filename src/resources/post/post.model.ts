import { model, Schema } from '@src/config/database';
import { Document, PopulatedDoc } from 'mongoose';
import { CommentDocument } from '../comment/comment.model';
import { ReactionDocument } from '../reaction/reaction.model';

export enum Privacy {
  PUBLIC,
  FRIENDS,
  ONLY_ME,
}

export enum PostType {
  POST,
  SHARE,
}

export interface BasePost {
  userId: string;
  createdAt: Date;
  privacy: Privacy;
  content: string;
  reactionIds: string[];
  reactions?: PopulatedDoc<ReactionDocument>[];
  commentIds: string[];
  comments?: PopulatedDoc<CommentDocument>[];
  /**
   * Store shared post ids
   */
  shareIds: string[];
  shares?: PopulatedDoc<PostDocument>[];
}

export interface NormalPost extends BasePost {
  type: PostType.POST;
}

export interface SharedPost extends BasePost {
  type: PostType.SHARE;
}

export type Post = NormalPost | SharedPost;

export const PostSchema = new Schema<Post>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: Number,
    enum: Object.values(PostType),
    required: true,
  },
  sourceId: {},
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
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
