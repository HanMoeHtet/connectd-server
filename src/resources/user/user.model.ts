import { model, Schema } from '@src/config/database.config';
import { CommentDocument } from '@src/resources/comment/comment.model';
import { FriendRequestDocument } from '@src/resources/friend-request/friend-request.model';
import { FriendDocument } from '@src/resources/friend/friend.model';
import { PostDocument } from '@src/resources/post/post.model';
import { ReactionDocument } from '@src/resources/reaction/reaction.model';
import { ReplyDocument } from '@src/resources/reply/reply.model';
import { UnverifiedUser } from '@src/resources/unverified-user/unverified-user.model';
import { Document, Model, Types } from 'mongoose';
import { ConversationDocument } from '../conversation/conversation.model';
import { NotificationDocument } from '../notification/notification.model';

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
  sentFriendRequestIds: string[];
  sentFriendRequests?: FriendRequestDocument[];
  receivedFriendRequestIds: string[];
  receivedFriendRequests?: FriendRequestDocument[];
  notificationIds: string[];
  notifications?: NotificationDocument[];
  lastSeenAt: Date | null;
  conversationIds: Types.ObjectId[];
  conversations?: ConversationDocument[];
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
    sentFriendRequestIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FriendRequest',
      },
    ],
    receivedFriendRequestIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FriendRequest',
      },
    ],
    notificationIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Notification',
      },
    ],
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    conversationIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
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

UserSchema.virtual('sentFriendRequests', {
  ref: 'FriendRequest',
  localField: 'sentFriendRequestIds',
  foreignField: '_id',
});

UserSchema.virtual('receivedFriendRequests', {
  ref: 'FriendRequest',
  localField: 'receivedFriendRequestIds',
  foreignField: '_id',
});

UserSchema.virtual('notifications', {
  ref: 'Notification',
  localField: 'notificationIds',
  foreignField: '_id',
});

UserSchema.virtual('conversations', {
  ref: 'Conversation',
  localField: 'conversationIds',
  foreignField: '_id',
});

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', {
  virtuals: true,
});

export const UserModel: Model<User> = model<User>('User', UserSchema);

export type UserDocument = User & Document<any, any, User>;

export default UserModel;
