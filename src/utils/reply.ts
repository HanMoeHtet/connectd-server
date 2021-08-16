import { BAD_REQUEST } from '@src/constants';
import { RequestError } from '@src/http/error-handlers/handler';
import Reply, { ReplyDocument } from '@src/resources/reply/reply.model';
import i18next from '@src/services/i18next';

export const findReply = async (replyId?: string) => {
  if (!replyId) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('missing', { field: 'replyId' })
    );
  }

  let reply;
  try {
    reply = await Reply.findById(replyId);
  } catch (err) {
    throw new RequestError(BAD_REQUEST, i18next.t('httpError.500'), err);
  }

  if (!reply) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('notFound', { field: 'reply' })
    );
  }

  return reply;
};

export const prepareReply = (reply: ReplyDocument) => {
  const {
    _id,
    userId,
    commentId,
    content,
    reactionCounts,
    reactionIds,
    user,
    createdAt,
  } = reply;

  return {
    _id,
    userId,
    commentId,
    content,
    reactionCounts,
    reactionIds,
    user,
    createdAt,
  };
};

export const prepareUpdatedFieldsInReply = (reply: ReplyDocument) => {
  return {
    _id: reply._id,
    content: reply.content,
    reactionCounts: reply.reactionCounts,
  };
};
