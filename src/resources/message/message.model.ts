import { model, Schema } from '@src/config/database.config';
import { Document, Model, Types } from 'mongoose';
import { ConversationDocument } from '../conversation/conversation.model';
import { UserDocument } from '../user/user.model';

export interface Message {
  fromUserId: Types.ObjectId;
  fromUser?: UserDocument;
  conversationId: Types.ObjectId;
  conversation?: ConversationDocument;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<Message>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { id: false }
);

MessageSchema.virtual('fromUser', {
  ref: 'User',
  localField: 'fromUserId',
  foreignField: '_id',
  justOne: true,
});

MessageSchema.virtual('conversation', {
  ref: 'Conversation',
  localField: 'conversationId',
  foreignField: '_id',
  justOne: true,
});

MessageSchema.set('toObject', { virtuals: true });
MessageSchema.set('toJSON', {
  virtuals: true,
});

export const MessageModel: Model<Message> = model<Message>(
  'Message',
  MessageSchema
);

export type MessageDocument = Message & Document<any, any, Message>;

export default MessageModel;
