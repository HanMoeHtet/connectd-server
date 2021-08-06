import { model, Schema } from '@src/config/database';
import { Document, PopulatedDoc } from 'mongoose';
import { CommentDocument } from '../comment/comment.model';
import { ReactionDocument, ReactionType } from '../reaction/reaction.model';

export enum Privacy {
  PUBLIC = 'PUBLIC',
  FRIENDS = 'FRIENDS',
  ONLY_ME = 'ONLY_ME',
}

export enum PostType {
  POST = 'POST',
  SHARE = 'SHARE',
}

export interface BasePost {
  userId: string;
  createdAt: Date;
  privacy: Privacy;
  content: string;
  reactions: Map<ReactionType, string[]>;
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
  sourceId: string;
}

export type Post = NormalPost | SharedPost;

export const PostSchema = new Schema<Post>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(PostType),
    required: true,
  },
  sourceId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
  privacy: {
    type: String,
    enum: Object.values(Privacy),
    required: true,
  },
  content: {
    type: String,
    required: true,
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
  commentIds: [
    {
      type: Schema.Types.ObjectId,
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

PostSchema.virtual('comments', {
  ref: 'Comment',
  localField: 'commentIds',
  foreignField: '_id',
});

PostSchema.virtual('shares', {
  ref: 'Post',
  localField: 'shareIds',
  foreignField: '_id',
});

PostSchema.set('toObject', { virtuals: true });
PostSchema.set('toJSON', { virtuals: true });

export const PostModel = model<Post>('Post', PostSchema);

export type PostDocument = Post & Document<any, any, Post>;

export default PostModel;
