import { model, Schema } from '@src/config/database';
import { Document, PopulatedDoc } from 'mongoose';
import { CommentDocument } from '../comment/comment.model';
import { ReactionDocument, ReactionType } from '../reaction/reaction.model';
import { UserDocument } from '../user/user.model';

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
  user?: PopulatedDoc<UserDocument>;
  createdAt: Date;
  privacy: Privacy;
  content: string;
  reactionCounts: Map<ReactionType, number>;
  reactionIds: string[];
  reactions: Map<ReactionType, string[]>;
  commentCount: number;
  commentIds: string[];
  comments?: PopulatedDoc<CommentDocument>[];
  shareCount: number;
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

export const PostSchema = new Schema<Post>(
  {
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
    commentCount: {
      type: Number,
      default: 0,
    },
    commentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    shareCount: {
      type: Number,
      default: 0,
    },
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
  },
  { id: false }
);

PostSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
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
PostSchema.set('toJSON', {
  virtuals: true,
});

export const PostModel = model<Post>('Post', PostSchema);

export type PostDocument = Post & Document<any, any, Post>;

export default PostModel;
