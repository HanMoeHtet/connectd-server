import { BAD_REQUEST, NOT_FOUND } from '@src/constants';
import Post from '@src/models/Post';
import User from '@src/models/User';
import i18next from '@src/services/i18next';
import { Request } from '@src/types/requests';
import { Response } from 'express';

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
