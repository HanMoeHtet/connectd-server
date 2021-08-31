import { UserDocument } from '../user/user.model';
import { model, Schema } from '@src/config/database.config';
import { Document } from 'mongoose';

export interface Friend {
  userIds: [string, string];
  users?: [UserDocument, UserDocument];
  createdAt: Date;
}

const FriendSchema = new Schema<Friend>({
  userIds: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FriendSchema.virtual('users', {
  ref: 'User',
  localField: 'userIds',
  foreignField: '_id',
});

FriendSchema.set('toObject', { virtuals: true });
FriendSchema.set('toJSON', {
  virtuals: true,
});

export const FriendModel = model<Friend>('Friend', FriendSchema);

export type FriendDocument = Friend & Document<any, any, Friend>;

export default FriendModel;
