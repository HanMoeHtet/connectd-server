import { EventEmitter } from 'events';
import { MessageDocument } from '@src/resources/message/message.model';
import { emitMessageCreated } from '@src/ws/emitters/message-created.emitter';
import UserModel from '@src/resources/user/user.model';

export const messageEventEmitter = new EventEmitter();

export enum MessageEventType {
  MESSAGE_CREATED = 'MESSAGE_CREATED',
}

messageEventEmitter.on(
  MessageEventType.MESSAGE_CREATED,
  async (message: MessageDocument) => {
    let { _id, conversationId, content, fromUser, createdAt } =
      message.toJSON();

    if (!fromUser) {
      try {
        fromUser = await UserModel.findOne({
          _id: message.fromUserId,
        })
          .orFail()
          .select({ _id: 1, username: 1, avatar: 1 });
      } catch (e) {
        console.error(e);
        return;
      }
    }
    emitMessageCreated({
      message: {
        _id,
        conversationId: String(conversationId),
        content,
        createdAt,
        fromUser: {
          _id: fromUser._id,
          avatar: fromUser.avatar,
          username: fromUser.username,
        },
      },
    });
  }
);
