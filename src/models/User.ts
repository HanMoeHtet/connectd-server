import { model, Schema } from '@src/config/database';
import { UserData } from '@src/types';
import { Document } from 'mongoose';

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
});

const User = model<UserData>('User', UserSchema);

export type User = UserData & Document<any, any, UserData>;

export default User;
