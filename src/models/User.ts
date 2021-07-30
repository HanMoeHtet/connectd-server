import { model, Schema } from '@src/config/database';
import { UserData } from '@src/types';
import { Document, Model } from 'mongoose';

const UserSchema = new Schema<UserData>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  avatar: String,
  email: String,
  emailVerifiedAt: Date,
  phoneNumber: String,
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
});

const User: Model<UserData> = model<UserData>('User', UserSchema);

export type UserDocument = UserData & Document<any, any, UserData>;

export default User;
