import { AUTH_TOKEN_TYPE } from '@src/constants';
import User from '@src/resources/user/user.model';
import i18next from '@src/services/i18next';
import { AuthTokenPayload } from '@src/types';
import { AuthSocket, NextFunction } from '@src/types/ws';
import { verify } from 'jsonwebtoken';

const checkAuth = async (socket: AuthSocket, next: NextFunction) => {
  const auth = socket.handshake.auth;

  if (!('token' in auth) || typeof auth.token !== 'string') {
    next(new Error(i18next.t('authError.invalidTokenType')));
    return;
  }

  const [type, token] = auth.token.split(' ');

  if (!type || type != AUTH_TOKEN_TYPE) {
    next(new Error(i18next.t('authError.invalidTokenType')));
    return;
  }

  if (!token) {
    next(new Error(i18next.t('authError.invalidToken')));
    return;
  }

  let userId;

  try {
    ({ userId } = verify(token, process.env.APP_SECRET!) as AuthTokenPayload);
  } catch (e) {
    next(new Error(i18next.t('authError.invalidToken')));
    return;
  }

  let user;
  try {
    user = await User.findById(userId);
  } catch (e) {
    next(new Error(i18next.t('authError.invalidToken')));
    return;
  }

  if (!user) {
    next(new Error(i18next.t('authError.invalidToken')));
    return;
  }

  socket.data.user = user;

  return next();
};

export default checkAuth;
