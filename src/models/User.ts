import { model, Schema } from '@src/config/database';
import { UserData } from '@src/types';
import { Document } from 'mongoose';

const UserSchema = new Schema<UserData>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: String,
  phoneNumber: String,
  hashedPassword: String,
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
