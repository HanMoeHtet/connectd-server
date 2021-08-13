import {
  BAD_REQUEST,
  CREATED,
  MAX_REACTIONS_PER_POST_PER_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  SUCCESS,
} from '@src/constants';
import { RequestError } from '@src/http/error-handlers/handler';
import { PostType } from '@src/resources/post/post.model';
import ReactionModel, {
  ReactionType,
} from '@src/resources/reaction/reaction.model';
import i18next from '@src/services/i18next';
import { Request } from '@src/types/requests';
import { AuthResponse } from '@src/types/responses';
import { compareMongooseIds } from '@src/utils/helpers';
import { NextFunction, Response } from 'express';
import { findComment, prepareUpdatedFieldsInComment } from '@src/utils/comment';

interface GetReactionsInCommentRequest
  extends Request<{
    params: {
      commentId?: string;
    };
    query: {
      // TODO: add first post id
      lastReactionId?: string;
      limit?: string;
      reactionType?: string;
    };
  }> {}
export const getReactionsInComment = async (
  req: GetReactionsInCommentRequest,
  res: Response,
  next: NextFunction
) => {
  let { limit, reactionType, lastReactionId: lastReactionId } = req.query;
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
        reactions: [],
      },
    });

  const _limit = Math.min(
    Number(limit) || MAX_REACTIONS_PER_POST_PER_REQUEST,
    MAX_REACTIONS_PER_POST_PER_REQUEST
  );
  const _reactionType = reactionType?.toUpperCase();

  let reactionIds;
  if (!_reactionType || !(_reactionType in ReactionType)) {
    reactionIds = comment.reactionIds;
  } else {
    reactionIds = comment.reactions.get(_reactionType as ReactionType);
  }

  const extraQuery = lastReactionId ? { $lt: lastReactionId } : {};

  const reactions = await ReactionModel.find({
    _id: {
      ...extraQuery,
      $in: reactionIds,
    },
  })
    .sort({ createdAt: -1 })
    .limit(_limit)
    .populate({
      path: 'user',
      select: { username: 1, avatar: 1 },
    })
    .select({
      type: 1,
      userId: 1,
    });

  return res.status(SUCCESS).json({
    data: {
      reactions,
      comment: prepareUpdatedFieldsInComment(comment),
    },
  });
};

interface AddReactionToCommentRequest
  extends Request<{
    params: {
      commentId?: string;
    };
    reqBody: {
      type?: string;
    };
  }> {}
export const addReactionToComment = async (
  req: AddReactionToCommentRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { commentId } = req.params;
  let { type } = req.body;

  type = type?.toUpperCase();

  if (!type || !(type in ReactionType)) {
    next(
      new RequestError(
        BAD_REQUEST,
        i18next.t('missing', { field: 'reaction type' })
      )
    );
    return;
  }

  const _type: ReactionType = <ReactionType>type;
  let comment;

  try {
    comment = await findComment(commentId);
  } catch (err) {
    next(err);
    return;
  }

  const basePopulateOptions = {
    path: 'populatedReactions',
    select: {
      userId: 1,
      type: 1,
    },
  };

  comment = await comment.populate(basePopulateOptions).execPopulate();

  if (!comment.populatedReactions) {
    next(new RequestError(SERVER_ERROR, i18next.t('httpError.500')));
    return;
  }

  const userReactedReaction = comment.populatedReactions.find((reaction) =>
    compareMongooseIds(reaction.userId, res.locals.user._id)
  );

  if (userReactedReaction) {
    const _type = userReactedReaction.type;
    console.log('asdfasd', userReactedReaction);

    comment.reactionCounts.set(
      _type,
      (comment.reactionCounts.get(_type) || 1) - 1
    );

    comment.reactionIds = comment.reactionIds.filter(
      (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
    );

    comment.reactions.set(
      _type,
      (comment.reactions.get(_type) || []).filter(
        (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
      )
    );

    res.locals.user.reactionIds = res.locals.user.reactionIds.filter(
      (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
    );

    await userReactedReaction.delete();
  }

  let reaction = new ReactionModel({
    userId: res.locals.user._id,
    sourceType: 'Post',
    sourceId: comment._id,
    type,
  });

  await reaction.save();

  comment.reactionCounts.set(
    _type,
    (comment.reactionCounts.get(_type) || 0) + 1
  );

  comment.reactionIds.push(reaction._id);

  comment.reactions.set(_type, [
    ...(comment.reactions.get(_type) || []),
    reaction._id,
  ]);

  await comment.save();

  res.locals.user.reactionIds.push(reaction._id);
  await res.locals.user.save();

  return res.status(CREATED).json({
    message: i18next.t('reaction.added'),
    data: {
      comment: prepareUpdatedFieldsInComment(comment),
    },
  });
};

interface RemoveReactionFromCommentRequest
  extends Request<{
    params: {
      commentId?: string;
    };
  }> {}
export const removeReactionFromComment = async (
  req: RemoveReactionFromCommentRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { commentId } = req.params;

  let comment;

  try {
    comment = await findComment(commentId);
  } catch (err) {
    next(err);
    return;
  }

  const basePopulateOptions = {
    path: 'populatedReactions',
    select: {
      userId: 1,
      type: 1,
    },
  };

  comment = await comment.populate(basePopulateOptions).execPopulate();

  if (!comment.populatedReactions) {
    next(new RequestError(SERVER_ERROR, i18next.t('httpError.500')));
    return;
  }

  const userReactedReaction = comment.populatedReactions.find((reaction) => {
    return compareMongooseIds(reaction.userId, res.locals.user._id);
  });

  if (!userReactedReaction) {
    next(new RequestError(NOT_FOUND, i18next.t('httpError.404')));
    return;
  } else {
    const _type = userReactedReaction.type;

    comment.reactionCounts.set(
      _type,
      (comment.reactionCounts.get(_type) || 1) - 1
    );

    comment.reactionIds = comment.reactionIds.filter(
      (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
    );

    comment.reactions.set(
      _type,
      (comment.reactions.get(_type) || []).filter(
        (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
      )
    );

    await comment.save();

    res.locals.user.reactionIds = res.locals.user.reactionIds.filter(
      (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
    );
    await res.locals.user.save();

    await userReactedReaction.delete();
  }

  return res.status(CREATED).json({
    message: i18next.t('reaction.removed'),
    data: {
      comment: prepareUpdatedFieldsInComment(comment),
    },
  });
};
