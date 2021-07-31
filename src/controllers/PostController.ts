import { BAD_REQUEST, SUCCESS } from '@src/constants';
import { RequestError } from '@src/error_handlers/handler';
import Post from '@src/models/Post';
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

  // post = post.populate({
  //   path: 'comments',
  //   options: { skip: Number(skip), limit: Number(limit) || 1 },
  // });

  post = await post.populate('comments').execPopulate();

  console.log(post.populated('comments'));

  return res.status(SUCCESS).json({
    data: {
      comments: post.comments,
    },
  });
};
