import { model, Schema } from '@src/config/database.config';
import { UnverifiedUser } from '@src/resources/unverified-user/unverified-user.model';
import { PostDocument } from '@src/resources/post/post.model';
import { Document, Model, PopulatedDoc } from 'mongoose';
import { ReactionDocument } from '@src/resources/reaction/reaction.model';
import { CommentDocument } from '@src/resources/comment/comment.model';
import { ReplyDocument } from '@src/resources/reply/reply.model';
import { FriendDocument } from '@src/resources/friend/friend.model';
import { FriendRequestDocument } from '@src/resources/friend/friend-request.model';

export interface User extends UnverifiedUser {
  avatar?: string;
  emailVerifiedAt?: Date;
  phoneNumberVerifiedAt?: Date;
  postIds: string[];
  posts?: PostDocument[];
  reactionIds: string[];
  reactions?: ReactionDocument[];
  commentIds: string[];
  comments?: CommentDocument[];
  replyIds: string[];
  replies?: ReplyDocument[];
  friendIds: string[];
  friends?: FriendDocument[];
  friendRequestIds: string[];
  friendRequests?: FriendRequestDocument[];
}

const UserSchema = new Schema<User>(
  {
    username: {
      type: String,
      required: true,
    },
    avatar: String,
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    emailVerifiedAt: Date,
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
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
    replyIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Reply',
      },
    ],
    friendIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Friend',
      },
    ],
    friendRequestIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FriendRequest',
      },
    ],
  },
  { id: false }
);

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

UserSchema.virtual('friends', {
  ref: 'Friend',
  localField: 'friendIds',
  foreignField: '_id',
});

UserSchema.virtual('friendRequests', {
  ref: 'FriendRequest',
  localField: 'friendRequestIds',
  foreignField: '_id',
});

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', {
  virtuals: true,
});

export const UserModel: Model<User> = model<User>('User', UserSchema);

export type UserDocument = User & Document<any, any, User>;

export default UserModel;
