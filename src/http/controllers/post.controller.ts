import { BAD_REQUEST, CREATED, SUCCESS } from '@src/constants';
import { RequestError } from '@src/http/error-handlers/handler';
import Post, { PostType } from '@src/resources/post/post.model';
import i18next from '@src/services/i18next';
import { Request } from '@src/types/requests';
import { AuthResponse } from '@src/types/responses';
import { NextFunction, Response } from 'express';
import { findPost, preparePost } from '@src/utils/post';
import { validateCreatePost } from '@src/utils/validation';
import { CreatePostFormData } from '@src/types';

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

  const populateOptions = {
    path: 'user',
    select: { username: 1, avatar: 1 },
  };

  if (post.type === PostType.POST) {
    post = await post.populate(populateOptions).execPopulate();
  } else if (post.type === PostType.SHARE) {
    post = await post.populate(populateOptions).execPopulate();
  }

  return res.status(SUCCESS).json({
    data: {
      post: preparePost(post),
    },
  });
};

interface CreateRequest
  extends Request<{
    reqBody: CreatePostFormData;
  }> {}

export const create = async (
  req: CreateRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  try {
    await validateCreatePost(req.body);
  } catch (e) {
    next(e);
    return;
  }

  const { _id: userId } = res.locals.user;
  const { privacy, content } = req.body;

  const populateOptions = {
    path: 'user',
    select: { username: 1, avatar: 1 },
  };

  let post = new Post({
    userId,
    privacy,
    content,
    type: PostType.POST,
  });

  if (post.type === PostType.POST) {
    post = await post.populate(populateOptions).execPopulate();
  } else if (post.type === PostType.SHARE) {
    post = await post.populate(populateOptions).execPopulate();
  }

  await post.save();

  res.status(CREATED).json({
    data: {
      post: preparePost(post),
    },
  });
};
