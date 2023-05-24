import { model, Schema } from '@src/config/database.config';
import { Document, Model } from 'mongoose';

export interface UnverifiedUser {
  username: string;
  email?: string;
  phoneNumber?: string;
  hash: string;
  birthday: Date;
}

const UnverifiedUserSchema = new Schema<UnverifiedUser>({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  hash: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
    required: true,
  }
});

export const UnverifiedUserModel = model<UnverifiedUser>(
  'UnverifiedUser',
  UnverifiedUserSchema,
  'unverified_users'
);

export type UnverifiedUserDocument = UnverifiedUser &
  Document<any, any, UnverifiedUser>;

export default UnverifiedUserModel;
