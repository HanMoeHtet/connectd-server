import { model, Schema } from '@src/config/database.config';
import { Document, Model, Types } from 'mongoose';
import { MessageDocument } from '../message/message.model';
import { UserDocument } from '../user/user.model';

export interface Conversation {
  userIds: [Types.ObjectId, Types.ObjectId];
  users?: [UserDocument, UserDocument];
  messageIds: Types.ObjectId[];
  messages?: MessageDocument[];
  createdAt: Date;
}

const ConversationSchema = new Schema<Conversation>(
  {
    userIds: {
      type: [Schema.Types.ObjectId],
      required: true,
      validate: {
        validator: (userIds: Types.ObjectId[]) => userIds.length === 2,
        message: 'Conversation must have 2 users',
      },
    },
    messageIds: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { id: false }
);

ConversationSchema.virtual('users', {
  ref: 'User',
  localField: 'userIds',
  foreignField: '_id',
});

ConversationSchema.virtual('messages', {
  ref: 'Message',
  localField: 'messageIds',
  foreignField: '_id',
});

ConversationSchema.set('toObject', { virtuals: true });
ConversationSchema.set('toJSON', {
  virtuals: true,
});

export const ConversationModel: Model<Conversation> = model<Conversation>(
  'Conversation',
  ConversationSchema
);

export type ConversationDocument = Conversation &
  Document<any, any, Conversation>;

export default ConversationModel;
