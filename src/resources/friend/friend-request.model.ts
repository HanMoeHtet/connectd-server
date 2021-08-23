import { UserDocument } from '../user/user.model';
import { model, Schema } from '@src/config/database.config';
import { Document } from 'mongoose';

export interface FriendRequest {
  senderId: string;
  receiverId: string;
  createdAt: Date;
}

const FriendRequest = new Schema<FriendRequest>({
  senderId: {
    type: String,
    required: true,
  },
  receiverId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FriendRequest.set('toObject', { virtuals: true });
FriendRequest.set('toJSON', {
  virtuals: true,
});

export const FriendRequestModel = model<FriendRequest>(
  'FriendRequest',
  FriendRequest
);

export interface FriendRequestDocument extends FriendRequest, Document {}

export default FriendRequestModel;
