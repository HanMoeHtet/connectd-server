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
import { findPost, prepareUpdatedFieldsInPost } from '@src/utils/post';

interface GetReactionsInPostRequest
  extends Request<{
    params: {
      postId?: string;
    };
    query: {
      // TODO: add first post id
      lastReactionId?: string;
      limit?: string;
      reactionType?: string;
    };
  }> {}
export const getReactionsInPost = async (
  req: GetReactionsInPostRequest,
  res: Response,
  next: NextFunction
) => {
  let { limit, reactionType, lastReactionId: lastReactionId } = req.query;
  const { postId } = req.params;

  let post;

  try {
    post = await findPost(postId);
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
    reactionIds = post.reactionIds;
  } else {
    reactionIds = post.reactions.get(_reactionType as ReactionType);
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
      post: prepareUpdatedFieldsInPost(post),
    },
  });
};

interface AddReactionToPostRequest
  extends Request<{
    params: {
      postId?: string;
    };
    reqBody: {
      type?: string;
    };
  }> {}
export const addReactionToPost = async (
  req: AddReactionToPostRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { postId } = req.params;
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
  let post;

  try {
    post = await findPost(postId);
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

  if (post.type === PostType.POST) {
    post = await post.populate(basePopulateOptions).execPopulate();
  } else {
    post = await post.populate(basePopulateOptions).execPopulate();
  }

  if (!post.populatedReactions) {
    next(new RequestError(SERVER_ERROR, i18next.t('httpError.500')));
    return;
  }

  const userReactedReaction = post.populatedReactions.find((reaction) =>
    compareMongooseIds(reaction.userId, res.locals.user._id)
  );

  if (userReactedReaction) {
    const _type = userReactedReaction.type;

    post.reactionCounts.set(_type, (post.reactionCounts.get(_type) || 1) - 1);

    post.reactionIds = post.reactionIds.filter(
      (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
    );

    post.reactions.set(
      _type,
      (post.reactions.get(_type) || []).filter(
        (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
      )
    );

    res.locals.user.reactionIds = res.locals.user.reactionIds.filter(
      (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
    );
    await res.locals.user.save();

    await userReactedReaction.delete();
  }

  let reaction = new ReactionModel({
    userId: res.locals.user._id,
    sourceType: 'Post',
    sourceId: post._id,
    type,
  });

  await reaction.save();

  post.reactionCounts.set(_type, (post.reactionCounts.get(_type) || 0) + 1);

  post.reactionIds.push(reaction._id);

  post.reactions.set(_type, [
    ...(post.reactions.get(_type) || []),
    reaction._id,
  ]);

  await post.save();

  res.locals.user.reactionIds.push(reaction._id);
  await res.locals.user.save();

  return res.status(CREATED).json({
    message: i18next.t('reaction.added'),
    data: {
      post: prepareUpdatedFieldsInPost(post),
    },
  });
};

interface RemoveReactionFromPostRequest
  extends Request<{
    params: {
      postId?: string;
    };
  }> {}
export const removeReactionFromPost = async (
  req: RemoveReactionFromPostRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { postId } = req.params;

  let post;

  try {
    post = await findPost(postId);
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

  if (post.type === PostType.POST) {
    post = await post.populate(basePopulateOptions).execPopulate();
  } else {
    post = await post.populate(basePopulateOptions).execPopulate();
  }

  if (!post.populatedReactions) {
    next(new RequestError(SERVER_ERROR, i18next.t('httpError.500')));
    return;
  }

  const userReactedReaction = post.populatedReactions.find((reaction) => {
    return compareMongooseIds(reaction.userId, res.locals.user._id);
  });

  if (!userReactedReaction) {
    next(new RequestError(NOT_FOUND, i18next.t('httpError.404')));
    return;
  } else {
    const _type = userReactedReaction.type;

    post.reactionCounts.set(_type, (post.reactionCounts.get(_type) || 1) - 1);

    post.reactionIds = post.reactionIds.filter(
      (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
    );

    post.reactions.set(
      _type,
      (post.reactions.get(_type) || []).filter(
        (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
      )
    );

    await post.save();

    res.locals.user.reactionIds = res.locals.user.reactionIds.filter(
      (reactionId) => !compareMongooseIds(reactionId, userReactedReaction._id)
    );
    await res.locals.user.save();

    await userReactedReaction.delete();
  }

  return res.status(CREATED).json({
    message: i18next.t('reaction.removed'),
    data: {
      post: prepareUpdatedFieldsInPost(post),
    },
  });
};
