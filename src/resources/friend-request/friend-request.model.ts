import { UserDocument } from '../user/user.model';
import { model, Schema } from '@src/config/database.config';
import { Document, Types } from 'mongoose';

export interface FriendRequest {
  senderId: string;
  sender?: UserDocument;
  receiverId: string;
  receiver?: UserDocument;
  createdAt: Date;
}

const FriendRequestSchema = new Schema<FriendRequest>({
  senderId: {
    type: Types.ObjectId,
    required: true,
  },
  receiverId: {
    type: Types.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FriendRequestSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true,
});

FriendRequestSchema.virtual('receiver', {
  ref: 'User',
  localField: 'receiverId',
  foreignField: '_id',
  justOne: true,
});

FriendRequestSchema.set('toObject', { virtuals: true });
FriendRequestSchema.set('toJSON', {
  virtuals: true,
});

export const FriendRequestModel = model<FriendRequest>(
  'FriendRequest',
  FriendRequestSchema,
  'friend_requests'
);

export interface FriendRequestDocument extends FriendRequest, Document {}

export default FriendRequestModel;
