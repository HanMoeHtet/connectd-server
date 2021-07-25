import { BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } from '@src/constants';
import User from '@src/models/User';
import i18next from '@src/services/i18next';
import { compare } from 'bcrypt';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';

export const logIn = async (
  req: Request<any, any, { email: string; password: string }, any>,
  res: Response
) => {
  const { email, password } = req.body;

  let user;

  try {
    user = await User.findOne({ email });
  } catch (e) {
    return res.status(BAD_REQUEST).json({
      errors: { email: i18next.t('logInError.invalid', { field: 'email' }) },
    });
  }

  if (!user) {
    return res.status(NOT_FOUND).json({
      errors: { email: i18next.t('logInError.notFound', { field: 'email' }) },
    });
  }

  let isPasswordCorrect;

  try {
    isPasswordCorrect = await compare(password, user.hash);
  } catch (e) {
    return res.status(BAD_REQUEST).json({
      errors: {
        password: i18next.t('logInError.invalid', { field: 'password' }),
      },
    });
  }

  if (!isPasswordCorrect) {
    return res.status(UNAUTHORIZED).json({
      errors: { password: i18next.t('logInError.incorrectPassword') },
    });
  }

  return res.status(200).json({
    data: { token: sign({ userId: user.id }, process.env.APP_SECRET!) },
  });
};
