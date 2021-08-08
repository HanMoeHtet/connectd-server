import {
  BAD_REQUEST,
  MAX_COMMENTS_PER_POST_PER_REQUEST,
  MAX_REACTIONS_PER_POST_PER_REQUEST,
  SUCCESS,
} from '@src/constants';
import { RequestError } from '@src/http/error-handlers/handler';
import Post, { PostType } from '@src/resources/post/post.model';
import { ReactionType } from '@src/resources/reaction/reaction.model';
import i18next from '@src/services/i18next';
import { Request } from '@src/types/requests';
import { NextFunction, Response } from 'express';

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

  const _skip = Number(req.query.skip) || 0;
  const _limit = Math.min(
    Number(limit) || MAX_REACTIONS_PER_POST_PER_REQUEST,
    MAX_REACTIONS_PER_POST_PER_REQUEST
  );

  let reactions;
  let hasMore;
  if (!reactionType || !(reactionType in ReactionType)) {
    if (post.type === PostType.POST) {
      post = await post
        .populate({
          path: 'reactionIds',
          options: {
            sort: {
              createdAt: -1,
            },
            skip: _skip,
            limit: _limit,
          },
        })
        .execPopulate();
    } else if (post.type === PostType.SHARE) {
      post = await post
        .populate({
          path: 'reactionIds',
          options: {
            skip: _skip,
            limit: _limit,
          },
        })
        .execPopulate();
    }

    reactions = post.reactionIds;
    hasMore = post.reactionIds.length > _limit + _skip;
  } else {
    if (post.type === PostType.POST) {
      post = await post
        .populate({
          path: `reactions.${reactionType}`,
          options: {
            sort: {
              createdAt: -1,
            },
            skip: _skip,
            limit: _limit,
          },
        })
        .execPopulate();
    }

    if (post.type === PostType.SHARE) {
      post = await post
        .populate({
          path: 'reactions',
          options: {
            skip: _skip,
            limit: _limit,
          },
        })
        .execPopulate();
    }

    reactions = post.reactions.get(reactionType as ReactionType);
    hasMore = post.reactions.get(reactionType as ReactionType)!.length > _limit;
  }

  return res.status(SUCCESS).json({
    data: {
      reactions,
      post: {
        id: post.id,
        content: post.content,
        privacy: post.privacy,
        reactionCounts: post.reactionCounts,
        commentCount: post.commentCount,
        shareCount: post.shareCount,
      },
      hasMore,
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
