import {
  BAD_REQUEST,
  CREATED,
  MAX_COMMENTS_PER_POST_PER_REQUEST,
  MAX_REACTIONS_PER_POST_PER_REQUEST,
  SUCCESS,
  UNAUTHORIZED,
  SERVER_ERROR,
  NOT_FOUND,
} from '@src/constants';
import { RequestError } from '@src/http/error-handlers/handler';
import Post, { PostType } from '@src/resources/post/post.model';
import ReactionModel, {
  ReactionType,
} from '@src/resources/reaction/reaction.model';
import i18next from '@src/services/i18next';
import { Request } from '@src/types/requests';
import { AuthResponse } from '@src/types/responses';
import { NextFunction, Response } from 'express';
import { compareMongooseIds } from '@src/utils/helpers';

const findPost = async (postId?: string) => {
  if (!postId) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('missing', { field: 'postId' })
    );
  }

  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    throw new RequestError(BAD_REQUEST, i18next.t('httpError.500'), err);
  }

  if (!post) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('notFound', { field: 'post' })
    );
  }

  return post;
};

interface ShowRequest
  extends Request<{
    params: {
      postId?: string;
    };
  }> {}

export const show = async (
  req: ShowRequest,
  res: Response,
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

  return res.status(SUCCESS).json({
    data: {
      post: post.toJSON(),
    },
  });
};

interface GetReactionsInPostRequest
  extends Request<{
    params: {
      postId?: string;
    };
    query: {
      skip?: string;
      limit?: string;
      reactionType?: string;
    };
  }> {}
export const getReactionsInPost = async (
  req: GetReactionsInPostRequest,
  res: Response,
  next: NextFunction
) => {
  let { skip, limit, reactionType } = req.query;
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

  const _skip = Number(skip) || 0;
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

  const reactions = await ReactionModel.find({
    _id: {
      $in: reactionIds,
    },
  })
    .sort({ createdAt: -1 })
    .skip(_skip)
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
      post: {
        _id: post._id,
        content: post.content,
        privacy: post.privacy,
        reactionCounts: post.reactionCounts,
        commentCount: post.commentCount,
        shareCount: post.shareCount,
      },
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

  const userReactedReaction = post.populatedReactions.find(
    (reaction) => compareMongooseIds(reaction.userId , res.locals.user._id)
  );

  if (userReactedReaction) {
    userReactedReaction.type = type;
    userReactedReaction.createdAt = Date.now();
    await userReactedReaction.save();
  } else {
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
  }

  return res.status(CREATED).json({
    message: i18next.t('reaction.added'),
    data: {
      post: {
        _id: post._id,
        content: post.content,
        privacy: post.privacy,
        reactionCounts: post.reactionCounts,
        commentCount: post.commentCount,
        shareCount: post.shareCount,
      },
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
    console.log(userReactedReaction);

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
      post: {
        _id: post._id,
        content: post.content,
        privacy: post.privacy,
        reactionCounts: post.reactionCounts,
        commentCount: post.commentCount,
        shareCount: post.shareCount,
      },
    },
  });
};

interface GetCommentsInPostRequest
  extends Request<{
    params: {
      postId?: string;
    };
    query: {
      skip?: string;
      limit?: string;
    };
  }> {}
export const getCommentsInPost = async (
  req: GetCommentsInPostRequest,
  res: Response,
  next: NextFunction
) => {
  const { skip, limit } = req.query;
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
        comments: [],
      },
    });

  if (post.type === PostType.POST) {
    post = await post
      .populate({
        path: 'comments',
        options: {
          skip: Number(skip),
          limit: Math.min(Number(limit), MAX_COMMENTS_PER_POST_PER_REQUEST),
        },
      })
      .execPopulate();
  }

  if (post.type === PostType.SHARE) {
    post = await post
      .populate({
        path: 'comments',
        options: {
          skip: Number(skip),
          limit: Math.min(Number(limit), MAX_COMMENTS_PER_POST_PER_REQUEST),
        },
      })
      .execPopulate();
  }

  return res.status(SUCCESS).json({
    data: {
      comments: post.comments,
    },
  });
};

interface GetSharesInPostRequest
  extends Request<{
    params: {
      postId?: string;
    };
    query: {
      skip?: string;
      limit?: string;
    };
  }> {}
export const getSharesInPost = async (
  req: GetSharesInPostRequest,
  res: Response,
  next: NextFunction
) => {
  const { skip, limit } = req.query;
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
        shares: [],
      },
    });

  if (post.type === PostType.POST) {
    post = await post
      .populate({
        path: 'shares',
        options: {
          skip: Number(skip),
          limit: Math.min(Number(limit), MAX_REACTIONS_PER_POST_PER_REQUEST),
        },
      })
      .execPopulate();
  }

  if (post.type === PostType.SHARE) {
    post = await post
      .populate({
        path: 'shares',
        options: {
          skip: Number(skip),
          limit: Math.min(Number(limit), MAX_REACTIONS_PER_POST_PER_REQUEST),
        },
      })
      .execPopulate();
  }

  return res.status(SUCCESS).json({
    data: {
      shares: post.shares,
    },
  });
};
