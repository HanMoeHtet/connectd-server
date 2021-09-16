import { EventEmitter } from 'events';
import { ConversationDocument } from '@src/resources/conversation/conversation.model';
import io from '@src/ws';
import { addUserToRoom, getSocketIdsByUserId } from '@src/utils/ws';

export const conversationEventEmitter = new EventEmitter();

export enum ConversationEventType {
  CONVERSATION_CREATED = 'CONVERSATION_CREATED',
}

conversationEventEmitter.on(
  ConversationEventType.CONVERSATION_CREATED,
  async (conversation: ConversationDocument) => {
    conversation.userIds.forEach((userId) => {
      addUserToRoom(String(userId), String(conversation._id));
    });
  }
);
