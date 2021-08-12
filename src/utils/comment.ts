import { BAD_REQUEST } from '@src/constants';
import { RequestError } from '@src/http/error-handlers/handler';
import Comment, { CommentDocument } from '@src/resources/comment/comment.model';
import i18next from '@src/services/i18next';

export const findComment = async (commentId?: string) => {
  if (!commentId) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('missing', { field: 'commentId' })
    );
  }

  let comment;
  try {
    comment = await Comment.findById(commentId);
  } catch (err) {
    throw new RequestError(BAD_REQUEST, i18next.t('httpError.500'), err);
  }

  if (!comment) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('notFound', { field: 'post' })
    );
  }

  return comment;
};

export const prepareUpdatedFieldsInComment = (comment: CommentDocument) => {
  return {
    _id: comment._id,
    content: comment.content,
    reactionCounts: comment.reactionCounts,
    replyCount: comment.replyCount,
  };
};
