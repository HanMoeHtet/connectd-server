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
  ReactionSourceType,
  ReactionType,
} from '@src/resources/reaction/reaction.model';
import i18next from '@src/services/i18next';
import { Request } from '@src/types/requests';
import { AuthResponse } from '@src/types/responses';
import { compareMongooseIds } from '@src/utils/helpers';
import { NextFunction, Response } from 'express';
import { findComment, prepareUpdatedFieldsInComment } from '@src/utils/comment';
import { findReply, prepareUpdatedFieldsInReply } from '@src/utils/reply';

interface GetReactionsInReplyRequest
  extends Request<{
    params: {
      replyId?: string;
    };
    query: {
      // TODO: add first post id
      lastReactionId?: string;
      limit?: string;
      reactionType?: string;
    };
  }> {}
export const getReactionsInReply = async (
  req: GetReactionsInReplyRequest,
  res: Response,
  next: NextFunction
) => {
  let { limit, reactionType, lastReactionId: lastReactionId } = req.query;
  const { replyId } = req.params;

  let reply;

  try {
    reply = await findReply(replyId);
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
    reactionIds = reply.reactionIds;
  } else {
    reactionIds = reply.reactions.get(_reactionType as ReactionType);
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
      reply: prepareUpdatedFieldsInReply(reply),
    },
  });
};

interface AddReactionToReplyRequest
  extends Request<{
    params: {
      replyId?: string;
    };
    reqBody: {
      type?: string;
    };
  }> {}
export const addReactionToReply = async (
  req: AddReactionToReplyRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { replyId } = req.params;
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
  let reply;

  try {
    reply = await findReply(replyId);
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

  reply = await reply.populate(basePopulateOptions).execPopulate();

  if (!reply.populatedReactions) {
    next(new RequestError(SERVER_ERROR, i18next.t('httpError.500')));
    return;
  }

  const userReactedReaction = reply.populatedReactions.find((reaction) =>
    compareMongooseIds(reaction.userId, res.locals.user._id)
  );

  if (userReactedReaction) {
    const _type = userReactedReaction.type;

    reply.reactionCounts.set(_type, (reply.reactionCounts.get(_type) || 1) - 1);

    reply.reactionIds = reply.reactionIds.filter(
      (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
    );

    reply.reactions.set(
      _type,
      (reply.reactions.get(_type) || []).filter(
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
    sourceType: ReactionSourceType.REPLY,
    sourceId: reply._id,
    type,
  });

  await reaction.save();

  reply.reactionCounts.set(_type, (reply.reactionCounts.get(_type) || 0) + 1);

  reply.reactionIds.push(reaction._id);

  reply.reactions.set(_type, [
    ...(reply.reactions.get(_type) || []),
    reaction._id,
  ]);

  await reply.save();

  res.locals.user.reactionIds.push(reaction._id);
  await res.locals.user.save();

  return res.status(CREATED).json({
    message: i18next.t('reaction.added'),
    data: {
      reply: prepareUpdatedFieldsInReply(reply),
    },
  });
};

interface RemoveReactionFromReplyRequest
  extends Request<{
    params: {
      replyId?: string;
    };
  }> {}
export const removeReactionFromReply = async (
  req: RemoveReactionFromReplyRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { replyId } = req.params;

  let reply;

  try {
    reply = await findReply(replyId);
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

  reply = await reply.populate(basePopulateOptions).execPopulate();

  if (!reply.populatedReactions) {
    next(new RequestError(SERVER_ERROR, i18next.t('httpError.500')));
    return;
  }

  const userReactedReaction = reply.populatedReactions.find((reaction) => {
    return compareMongooseIds(reaction.userId, res.locals.user._id);
  });

  if (!userReactedReaction) {
    next(new RequestError(NOT_FOUND, i18next.t('httpError.404')));
    return;
  } else {
    const _type = userReactedReaction.type;

    reply.reactionCounts.set(_type, (reply.reactionCounts.get(_type) || 1) - 1);

    reply.reactionIds = reply.reactionIds.filter(
      (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
    );

    reply.reactions.set(
      _type,
      (reply.reactions.get(_type) || []).filter(
        (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
      )
    );

    await reply.save();

    res.locals.user.reactionIds = res.locals.user.reactionIds.filter(
      (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
    );
    await res.locals.user.save();

    await userReactedReaction.delete();
  }

  return res.status(SUCCESS).json({
    message: i18next.t('reaction.removed'),
    data: {
      reply: prepareUpdatedFieldsInReply(reply),
    },
  });
};
