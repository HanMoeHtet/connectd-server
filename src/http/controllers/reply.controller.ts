import {
  CREATED,
  MAX_REPLIES_PER_COMMENT_PER_REQUEST,
  SERVER_ERROR,
  SUCCESS,
} from '@src/constants';
import CommentModel from '@src/resources/comment/comment.model';
import { MediaType, PostType } from '@src/resources/post/post.model';
import ReactionModel from '@src/resources/reaction/reaction.model';
import ReplyModel from '@src/resources/reply/reply.model';
import i18next from '@src/services/i18next';
import { upload } from '@src/services/storage';
import { Request } from '@src/types/requests';
import { AuthResponse } from '@src/types/responses';
import { prepareComment } from '@src/utils/comment';
import { findComment, prepareUpdatedFieldsInComment } from '@src/utils/comment';
import { isImage } from '@src/utils/media-type';
import { prepareReply } from '@src/utils/reply';
import {
  validateCreateComment,
  validateCreateReply,
} from '@src/utils/validation';
import { NextFunction, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface GetRepliesInCommentRequest
  extends Request<{
    params: {
      commentId?: string;
    };
    query: {
      lastReplyId?: string;
      limit?: string;
    };
  }> {}
export const getRepliesInComment = async (
  req: GetRepliesInCommentRequest,
  res: Response,
  next: NextFunction
) => {
  const { lastReplyId, limit } = req.query;
  const { commentId } = req.params;

  let comment;

  try {
    comment = await findComment(commentId);
  } catch (err) {
    next(err);
    return;
  }

  if (!limit)
    return res.status(SUCCESS).json({
      data: {
        comments: [],
      },
    });

  const _limit = Math.min(
    Number(limit) || MAX_REPLIES_PER_COMMENT_PER_REQUEST,
    MAX_REPLIES_PER_COMMENT_PER_REQUEST
  );

  const extraQuery = lastReplyId ? { _id: { $lt: lastReplyId } } : {};

  const populateOptions = {
    path: 'replies',
    match: {
      ...extraQuery,
    },
    options: {
      sort: { createdAt: -1 },
      limit: _limit,
    },
    populate: {
      path: 'user',
      select: {
        username: 1,
        avatar: 1,
      },
    },
    select: {
      userId: 1,
      commentId: 1,
      content: 1,
      media: 1,
      reactionCounts: 1,
      reactionIds: 1,
      replyCount: 1,
      user: 1,
      createdAt: 1,
    },
  };

  comment = await comment.populate(populateOptions).execPopulate();

  if (!comment.replies) {
    return res.status(SERVER_ERROR).json({
      message: i18next.t('httpError.500'),
    });
  }

  const responseReplies = await Promise.all(
    comment.replies.map(async (reply) => {
      const reactions = await ReactionModel.find({
        _id: { $in: reply.reactionIds },
      }).select({
        type: 1,
      });
      const userReactedRection = reactions.find(
        (reaction) => reaction.userId === res.locals.user.id
      );

      const { reactionIds, ...rest } = reply.toJSON();

      return {
        ...rest,
        userReactedReactionType: userReactedRection?.type,
      };
    })
  );

  return res.status(SUCCESS).json({
    data: {
      replies: responseReplies,
      comment: prepareUpdatedFieldsInComment(comment),
    },
  });
};

interface CreateReplyRequest
  extends Request<{
    reqBody: {
      content: string;
    };
    params: {
      commentId: string;
    };
  }> {}
export const createReply = async (
  req: CreateReplyRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  try {
    await validateCreateReply(req.body, { minContentLength: req.file ? 0 : 1 });
  } catch (e) {
    next(e);
    return;
  }

  const { content } = req.body;
  const { commentId } = req.params;

  let comment;

  try {
    comment = await findComment(commentId);
  } catch (e) {
    next(e);
    return;
  }

  let media;

  if (req.file) {
    media = {
      url: await upload(`media/${uuidv4()}`, req.file.buffer),
      type: isImage(req.file.mimetype) ? MediaType.IMAGE : MediaType.VIDEO,
    };
  }

  const user = res.locals.user;

  let reply = new ReplyModel({
    userId: user._id,
    commentId: comment._id,
    content,
    media,
  });

  reply = await reply
    .populate({
      path: 'user',
      select: {
        username: 1,
        avatar: 1,
      },
    })
    .execPopulate();

  await reply.save();

  comment.replyCount++;
  comment.replyIds.push(reply._id);
  await comment.save();

  user.replyIds.push(reply._id);
  await user.save();

  res.status(CREATED).json({
    data: {
      reply: prepareReply(reply),
      comment: prepareUpdatedFieldsInComment(comment),
    },
  });
};
