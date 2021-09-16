import {
  BAD_REQUEST,
  CREATED,
  MAX_MESSAGES_PER_REQUEST,
  SERVER_ERROR,
  SUCCESS,
} from '@src/constants';
import ConversationModel, {
  ConversationDocument,
} from '@src/resources/conversation/conversation.model';
import i18next from '@src/services/i18next';
import { Request } from '@src/types/requests';
import { AuthResponse } from '@src/types/responses';
import { NextFunction } from 'express';
import { RequestError } from '../error-handlers/handler';
import {
  canAccessConversation,
  canCreateConversation,
  findConversation,
} from '@src/utils/conversation';
import { validateCreateMessageInConversation } from '@src/utils/validation';
import MessageModel from '@src/resources/message/message.model';
import { findUser } from './user.controller';
import { UserDocument } from '@src/resources/user/user.model';
import {
  conversationEventEmitter,
  ConversationEventType,
} from '@src/events/conversation';
import {
  messageEventEmitter,
  MessageEventType,
} from '@src/events/message.event';

interface GetConversationsWithUserRequest
  extends Request<{
    params: {
      userId?: string;
    };
  }> {}

export const getConversationWithUser = async (
  req: GetConversationsWithUserRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { userId } = req.params;
  const authUser = res.locals.user;

  let user: UserDocument;
  try {
    user = await findUser(userId);
  } catch (e) {
    next(e);
    return;
  }

  let conversation: ConversationDocument | null;
  try {
    conversation = await ConversationModel.findOne({
      userIds: {
        $all: [userId, authUser._id],
        $size: 2,
      },
    }).orFail();
  } catch (e) {
    try {
      canCreateConversation(authUser, user);
    } catch (e) {
      next(e);
      return;
    }
    conversation = new ConversationModel({
      userIds: [authUser._id, userId],
    });
    await conversation.save();

    authUser.conversationIds.push(conversation._id);
    await authUser.save();

    user.conversationIds.push(conversation._id);
    await user.save();

    conversationEventEmitter.emit(
      ConversationEventType.CONVERSATION_CREATED,
      conversation
    );
  }

  res.status(SUCCESS).json({
    data: {
      conversation: {
        _id: conversation._id,
        userIds: conversation.userIds,
        user: {
          _id: user._id,
          avatar: user.avatar,
          username: user.username,
        },
      },
    },
  });
};

interface GetMessagesInConversationRequest
  extends Request<{
    params: {
      conversationId?: string;
    };
    query: {
      lastMessageId?: string;
    };
  }> {}

export const getMessagesInConversation = async (
  req: GetMessagesInConversationRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { conversationId } = req.params;
  const { lastMessageId } = req.query;
  const authUser = res.locals.user;

  let conversation: ConversationDocument;
  try {
    conversation = await findConversation(conversationId);
  } catch (e) {
    next(e);
    return;
  }

  try {
    canAccessConversation(authUser, conversation);
  } catch (e) {
    next(e);
    return;
  }

  const extraQuery = lastMessageId ? { _id: { $lt: lastMessageId } } : {};

  conversation = await conversation
    .populate({
      path: 'messages',
      match: {
        ...extraQuery,
      },
      options: {
        sort: {
          createdAt: -1,
        },
        limit: MAX_MESSAGES_PER_REQUEST,
      },
      select: {
        fromUserId: 1,
        content: 1,
        createdAt: 1,
      },
      populate: {
        path: 'fromUser',
        select: {
          _id: 1,
          username: 1,
          avatar: 1,
        },
      },
    })
    .execPopulate();

  if (!conversation.messages) {
    next(new RequestError(SERVER_ERROR, i18next.t('httpError.500')));
    return;
  }

  const nextLastMessageId =
    conversation.messages[conversation.messages.length - 1];

  const hasMore = async () => {
    const count = await MessageModel.find({
      _id: {
        $in: conversation.messageIds,
        $lt: nextLastMessageId,
      },
    })
      .sort({ createdAt: -1 })
      .countDocuments();
    console.log(conversation.messageIds, count);

    return count > 0;
  };

  res.status(SUCCESS).json({
    data: {
      messages: conversation.messages,
      hasMore: await hasMore(),
    },
  });
};

interface CreateMessageInConversationRequest
  extends Request<{
    params: {
      conversationId?: string;
    };
    reqBody: {
      content?: string;
    };
  }> {}

export const createMessageInConversation = async (
  req: CreateMessageInConversationRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { conversationId } = req.params;
  const { content } = req.body;
  const authUser = res.locals.user;

  let conversation: ConversationDocument;
  try {
    conversation = await findConversation(conversationId);
  } catch (e) {
    next(e);
    return;
  }

  try {
    canAccessConversation(authUser, conversation);
  } catch (e) {
    next(e);
    return;
  }

  try {
    validateCreateMessageInConversation(req.body);
  } catch (e) {
    next(e);
    return;
  }

  const message = new MessageModel({
    content,
    conversationId,
    fromUserId: authUser._id,
  });
  await message.save();

  conversation.messageIds.push(message._id);
  await conversation.save();

  res.status(CREATED).json({
    data: {
      message: {
        _id: message._id,
        content,
        fromUser: {
          _id: authUser._id,
          username: authUser.username,
          avatar: authUser.avatar,
        },
        createdAt: message.createdAt,
      },
    },
  });

  messageEventEmitter.emit(MessageEventType.MESSAGE_CREATED, message);
};
