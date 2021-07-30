import { model, Schema } from '@src/config/database';
import { UnverifiedUserData } from '@src/types';
import { Post } from '@src/types/Post';
import { Document, Model, PopulatedDoc } from 'mongoose';

export interface UserData extends UnverifiedUserData {
  avatar?: string;
  postIds: string[];
  emailVerifiedAt?: Date;
  phoneNumberVerifiedAt?: Date;
  posts?: PopulatedDoc<Post & Document>;
}

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

UserSchema.virtual('posts', {
  ref: 'Post',
  localField: 'postIds',
  foreignField: '_id',
});

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

const User: Model<UserData> = model<UserData>('User', UserSchema);

export type UserDocument = UserData & Document<any, any, UserData>;

export default User;
