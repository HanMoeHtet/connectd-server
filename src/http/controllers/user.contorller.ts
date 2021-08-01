import { BAD_REQUEST, NOT_FOUND } from '@src/constants';
import { RequestError } from '@src/error-handlers/handler';
import Post from '@src/resources/models/Post';
import User, { UserModel } from '@src/resources/models/User';
import i18next from '@src/services/i18next';
import { Request } from '@src/types/requests';
import {
  prepareBasicProfileResponse,
  prepareProfileResponse,
} from '@src/utils/profile';
import { NextFunction, Response } from 'express';

export const findUser = async (userId?: string) => {
  if (!userId) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('missing', { field: 'userId' })
    );
  }

  let user;
  try {
    user = await UserModel.findById(userId);
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

  return res.json({
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

  return res.json({
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

  return res.json({
    data: user.posts,
  });
};
