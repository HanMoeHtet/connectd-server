import {
  BAD_REQUEST,
  CREATED,
  MAX_REACTIONS_PER_POST_PER_REQUEST,
  SUCCESS,
} from '@src/constants';
import PostModel, { PostType } from '@src/resources/post/post.model';
import { Request } from '@src/types/requests';
import { NextFunction, Response } from 'express';
import { findPost, preparePost, prepareShare } from '@src/utils/post';
import { CreateShareFormData } from '@src/types';
import { validateCreateShare } from '@src/utils/validation';
import i18next from '@src/services/i18next';
import { AuthResponse } from '@src/types/responses';
import { RequestError } from '../error-handlers/handler';

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

interface CreateRequest
  extends Request<{
    reqBody: CreateShareFormData;
    params: {
      postId: string;
    };
  }> {}

export const create = async (
  req: CreateRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  try {
    await validateCreateShare(req.body);
  } catch (e) {
    next(e);
    return;
  }

  const { _id: userId } = res.locals.user;
  const { privacy, content } = req.body;
  const { postId: sourceId } = req.params;

  let post = new PostModel({
    userId,
    privacy,
    content,
    type: PostType.SHARE,
    sourceId,
  });

  const populateOptions = {
    path: 'user',
    select: { username: 1, avatar: 1 },
  };

  if (post.type === PostType.SHARE) {
    post = await post
      .populate(populateOptions)
      .populate({
        path: 'source',
        populate: {
          path: 'user',
          select: {
            username: 1,
            avatar: 1,
          },
        },
        select: {
          userId: 1,
          type: 1,
          privacy: 1,
          content: 1,
          createdAt: 1,
          user: 1,
        },
      })
      .execPopulate();
  } else {
    next(new RequestError(BAD_REQUEST, i18next.t('httpError.500')));
    return;
  }

  await post.save();

  res.status(CREATED).json({
    data: {
      post: prepareShare(post),
    },
  });
};
