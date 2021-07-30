import {
  BAD_REQUEST,
  CONFLICT,
  EMAIL_VERIFICATION_TOKEN_EXPIRATION_IN_MS,
  SERVER_ERROR,
  SUCCESS,
  UNAUTHORIZED,
} from '@src/constants';
import EmailVerification from '@src/models/EmailVerification';
import UnverifiedUser from '@src/models/UnverifiedUser';
import User from '@src/models/User';
import i18next from '@src/services/i18next';
import { sendVerificationMail } from '@src/services/mail';
import { EmailVerificationTokenPayload } from '@src/types';
import { Request, Response } from 'express';
import { sign, verify as verifyJwt } from 'jsonwebtoken';

export const verify = async (
  req: Request<null, null, { token: string }, null>,
  res: Response
) => {
  const { token } = req.body;

  let userId;

  try {
    ({ userId } = verifyJwt(
      token,
      process.env.APP_SECRET!
    ) as EmailVerificationTokenPayload);
  } catch (e) {
    console.error('Error verifying email token:', e);
    return res.status(BAD_REQUEST).json({
      message: i18next.t('verificationError.token.invalid'),
    });
  }

  let user;
  try {
    user = await UnverifiedUser.findById(userId);
  } catch (e) {
    console.error('Error finding user:', e);
    return res.status(BAD_REQUEST).json({
      message: i18next.t('verificationError.token.invalid'),
    });
  }

  if (!user) {
    return res.status(BAD_REQUEST).json({
      message: i18next.t('verificationError.token.invalid'),
    });
  }

  let emailVerification;
  try {
    emailVerification = await EmailVerification.findOne({
      userId: user.id,
    });
  } catch (e) {
    console.error('Error finding email verification:', e);
    return res.status(BAD_REQUEST).json({
      message: i18next.t('verificationError.token.invalid'),
    });
  }

  if (!emailVerification) {
    return res.status(BAD_REQUEST).json({
      message: i18next.t('verificationError.token.invalid'),
    });
  }

  const expiredTime =
    emailVerification.createdAt.getTime() +
    EMAIL_VERIFICATION_TOKEN_EXPIRATION_IN_MS;

  if (expiredTime < Date.now()) {
    emailVerification.delete();
    return res.status(BAD_REQUEST).json({
      message: i18next.t('verificationError.token.expired', {
        date: new Date(expiredTime),
      }),
    });
  }

  const verifiedUser = new User({
    ...user.toJSON(),
  });

  await user.delete();
  await emailVerification.delete();

  verifiedUser.emailVerifiedAt = new Date();
  await verifiedUser.save();

  return res.status(SUCCESS).json({
    data: {
      token: sign({ userId }, process.env.APP_SECRET!),
    },
  });
};

export const resend = async (
  req: Request<null, null, { userId: string }, null>,
  res: Response
) => {
  const { userId } = req.body;

  let user;
  try {
    user = await UnverifiedUser.findById(userId);
  } catch (e) {
    console.error('Error finding user:', e);
    return res.status(BAD_REQUEST).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

  if (!user) {
    return res.status(BAD_REQUEST).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

  try {
    await EmailVerification.deleteOne({ userId });
  } catch (e) {
    console.error('Error deleting phone number verification:', e);
    return res.status(BAD_REQUEST).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

  try {
    await sendVerificationMail(user);
  } catch (e) {
    console.error('Error sending verification mail:', e);
    return res.status(SERVER_ERROR).json({
      message: i18next.t('httpError.500'),
    });
  }

  return res.status(SUCCESS).json({
    message: i18next.t('verificationSuccess.email', { email: user.email }),
  });
};
