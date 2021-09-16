import { BAD_REQUEST, FORBIDDEN } from '@src/constants';
import { RequestError } from '@src/http/error-handlers/handler';
import ConversationModel, {
  ConversationDocument,
} from '@src/resources/conversation/conversation.model';
import { UserDocument } from '@src/resources/user/user.model';
import i18next from '@src/services/i18next';
import { areUsersFriends } from './friend';
import { compareMongooseIds } from './helpers';

export const findConversation = async (conversationId?: string) => {
  if (!conversationId) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('missing', { field: 'conversationId' })
    );
  }

  let conversation;
  try {
    conversation = await ConversationModel.findById(conversationId);
  } catch (err) {
    throw new RequestError(BAD_REQUEST, i18next.t('httpError.500'), err);
  }

  if (!conversation) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('notFound', { field: 'conversation' })
    );
  }

  return conversation;
};

export const canCreateConversation = async (
  userOne: UserDocument,
  userTwo: UserDocument
) => {
  if (compareMongooseIds(userOne._id, userTwo._id)) {
    throw new RequestError(BAD_REQUEST, i18next.t('httpError.400', {}));
  }

  if (!areUsersFriends(userOne, userTwo)) {
    throw new RequestError(FORBIDDEN, i18next.t('httpError.403', {}));
  }

  return true;
};

export const canAccessConversation = async (
  user: UserDocument,
  conversation: ConversationDocument
) => {
  if (!conversation.userIds.includes(user._id)) {
    throw new RequestError(FORBIDDEN, i18next.t('httpError.403'));
  }

  return true;
};
