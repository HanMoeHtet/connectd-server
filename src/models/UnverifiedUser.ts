import { model, Schema } from '@src/config/database';
import { UnverifiedUserData } from '@src/types';
import { Document, Model } from 'mongoose';

const UnverifiedUserSchema = new Schema<UnverifiedUserData>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: String,
  phoneNumber: String,
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

const User = model<UnverifiedUserData>(
  'UnverifiedUser',
  UnverifiedUserSchema,
  'unverified_users'
);

export type UserDocument = UnverifiedUserData &
  Document<any, any, UnverifiedUserData>;

export default User;
