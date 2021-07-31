import { model, Schema } from '@src/config/database';
import { UnverifiedUser } from '@src/models/UnverifiedUser';
import { PostDocument } from '@src/models/Post';
import { Document, Model, PopulatedDoc } from 'mongoose';
import { ReactionDocument } from './Reaction';
import { CommentDocument } from './Comment';
import { ReplyDocument } from './Reply';

export interface User extends UnverifiedUser {
  avatar?: string;
  emailVerifiedAt?: Date;
  phoneNumberVerifiedAt?: Date;
  postIds: string[];
  posts?: PopulatedDoc<PostDocument>[];
  reactionIds: string[];
  reactions?: PopulatedDoc<ReactionDocument>[];
  commentIds: string[];
  comments?: PopulatedDoc<CommentDocument>[];
  replyIds: string[];
  replies?: PopulatedDoc<ReplyDocument>[];
}

const UserSchema = new Schema<User>({
  username: {
    type: String,
    required: true,
  },
  avatar: String,
  email: {
    type: String,
    unique: true,
  },
  emailVerifiedAt: Date,
  phoneNumber: {
    type: String,
    unique: true,
  },
  phoneNumberVerfiedAt: Date,
  hash: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
  pronouns: {
    subjective: { type: String, required: true },
    objective: { type: String, required: true },
    possessive: { type: String, required: true },
  },
  postIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  reactionIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Reaction',
    },
  ],
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
});

UserSchema.virtual('posts', {
  ref: 'Post',
  localField: 'postIds',
  foreignField: '_id',
});

UserSchema.virtual('reactions', {
  ref: 'Reaction',
  localField: 'reactionIds',
  foreignField: '_id',
});

UserSchema.virtual('comments', {
  ref: 'Comment',
  localField: 'commentIds',
  foreignField: '_id',
});

UserSchema.virtual('replies', {
  ref: 'Reply',
  localField: 'replyIds',
  foreignField: '_id',
});

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

export const UserModel: Model<User> = model<User>('User', UserSchema);

export type UserDocument = User & Document<any, any, User>;

export default UserModel;
