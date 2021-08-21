import { BAD_REQUEST, NOT_FOUND, SUCCESS } from '@src/constants';
import { RequestError } from '@src/http/error-handlers/handler';
import Post from '@src/resources/post/post.model';
import User, { UserModel } from '@src/resources/user/user.model';
import i18next from '@src/services/i18next';
import { Request } from '@src/types/requests';
import { AuthResponse } from '@src/types/responses';
import {
  prepareBasicProfileResponse,
  prepareProfileResponse,
} from '@src/utils/profile';
import { NextFunction, Response } from 'express';

export const findUser = async (userId?: string, selectOptions?: {}) => {
  if (!userId) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('missing', { field: 'userId' })
    );
  }

  let user;
  try {
    user = await UserModel.findById(userId).select(selectOptions);
  } catch (e) {
    throw new RequestError(BAD_REQUEST, i18next.t('httpError.500'), e);
  }

  if (!user) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('notFound', { field: 'user' })
    );
  }

  return user;
};

export interface GetProfileRequest
  extends Request<{
    params: {
      userId?: string;
    };
  }> {}
export const getProfile = async (
  req: GetProfileRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  let user;
  try {
    user = await findUser(userId);
  } catch (e) {
    next(e);
    return;
  }

  return res.status(SUCCESS).json({
    data: {
      user: prepareProfileResponse(user),
    },
  });
};

export interface GetProfileRequest
  extends Request<{
    params: {
      userId?: string;
    };
  }> {}
export const getBasicProfile = async (
  req: GetProfileRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  let user;
  try {
    user = await findUser(userId);
  } catch (e) {
    next(e);
    return;
  }

  return res.status(SUCCESS).json({
    data: {
      user: prepareBasicProfileResponse(user),
    },
  });
};

interface GetPostsByUserRequest
  extends Request<{
    params: {
      userId?: string;
    };
    query: {
      limit?: string;
      skip?: string;
    };
  }> {}
export const getPostsByUser = async (
  req: GetPostsByUserRequest,
  res: Response
) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(BAD_REQUEST).json({
      message: i18next.t('missing', { field: 'userId' }),
    });
  }

  let user;
  try {
    user = await User.findById(userId).populate('posts').exec();
  } catch (err) {
    console.log(err);
    return res.status(BAD_REQUEST).json({
      message: i18next.t('httpEror.500'),
    });
  }

  if (!user) {
    return res.status(NOT_FOUND).json({
      message: i18next.t('notFound', { field: 'user' }),
    });
  }

  return res.status(SUCCESS).json({
    data: {
      posts: user.posts,
    },
  });
};

interface ShowRequest
  extends Request<{
    params: {
      userId?: string;
    };
  }> {}
export const show = async (
  req: ShowRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { userId } = req.params;

  let user;
  try {
    user = await findUser(userId, {
      username: 1,
      email: 1,
      phoneNumber: 1,
      birthday: 1,
      pronouns: 1,
      avatar: 1,
      postIds: 1,
      friendIds: 1,
    });
  } catch (e) {
    next(e);
    return;
  }

  const friendCount = user.friendIds.length;
  const postCount = user.postIds.length;

  const isAuthUser = userId === res.locals.user._id;
  const areUsersFriends = isAuthUser
    ? undefined
    : user.friendIds.includes(res.locals.user._id);

  const { postIds, friendIds, ...rest } = user.toJSON();

  res.status(SUCCESS).json({
    data: {
      user: {
        ...rest,
        friendCount,
        postCount,
      },
      isAuthUser,
      areUsersFriends,
    },
  });
};
