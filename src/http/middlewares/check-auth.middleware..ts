import { AUTH_TOKEN_TYPE, BAD_REQUEST } from '@src/constants';
import User from '@src/resources/user/user.model';
import i18next from '@src/services/i18next';
import { AuthTokenPayload } from '@src/types';
import { NextFunction, Response, Request } from 'express';
import { verify } from 'jsonwebtoken';

const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(BAD_REQUEST).json({
      message: i18next.t('authError.missingHeader'),
    });
  }

  const [type, token] = header.split(' ');

  if (!type || type != AUTH_TOKEN_TYPE) {
    return res.status(BAD_REQUEST).json({
      message: i18next.t('authError.invalidTokenType'),
    });
  }

  if (!token) {
    return res.status(BAD_REQUEST).json({
      message: i18next.t('authError.invalidToken'),
    });
  }

  let userId;

  try {
    ({ userId } = verify(token, process.env.APP_SECRET!) as AuthTokenPayload);
  } catch (e) {
    return res.status(BAD_REQUEST).json({
      message: i18next.t('authError.invalidToken'),
    });
  }

  let user;
  try {
    user = await User.findById(userId);
  } catch (e) {
    return res.status(BAD_REQUEST).json({
      message: i18next.t('authError.invalidToken'),
    });
  }

  if (!user) {
    return res.status(BAD_REQUEST).json({
      message: i18next.t('authError.invalidToken'),
    });
  }

  res.locals.user = user;

  return next();
};

export default checkAuth;
