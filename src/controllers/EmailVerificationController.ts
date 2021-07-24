import { EMAIL_VERIFICATION_TOKEN_EXPIRATION_IN_MS } from '@src/constants';
import EmailVerification from '@src/models/EmailVerification';
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

  let userId: string;

  try {
    ({ userId } = verifyJwt(
      token,
      process.env.APP_SECRET!
    ) as EmailVerificationTokenPayload);
  } catch (e) {
    console.error('Error verifying email token:', e);
    return res.status(401).json({
      message: i18next.t('verificationError.token'),
    });
  }

  let user;
  try {
    user = await User.findById(userId);
  } catch (e) {
    console.error('Error finding user:', e);
    return res.status(401).json({
      message: i18next.t('verificationError.token'),
    });
  }

  if (!user) {
    return res.status(401).json({
      message: i18next.t('verificationError.token'),
    });
  }

  let emailVerification;
  try {
    emailVerification = await EmailVerification.findOne({
      userId: user.id,
    });
  } catch (e) {
    console.error('Error finding email verification:', e);
    return res.status(401).json({
      message: i18next.t('verificationError.token'),
    });
  }

  if (!emailVerification) {
    return res.status(401).json({
      message: i18next.t('verificationError.token.invalid'),
    });
  }

  emailVerification.delete();

  const expiredTime =
    emailVerification.createdAt.getTime() +
    EMAIL_VERIFICATION_TOKEN_EXPIRATION_IN_MS;

  if (expiredTime < Date.now()) {
    return res.status(401).json({
      message: i18next.t('verificationError.token.expired', {
        date: new Date(expiredTime),
      }),
    });
  }

  user.emailVerifiedAt = new Date();
  await user.save();

  return res.status(200).json({
    token: sign({ userId }, process.env.APP_SECRET!),
  });
};

export const resend = async (
  req: Request<null, null, { userId: string }, null>,
  res: Response
) => {
  const { userId } = req.body;

  let user;
  try {
    user = await User.findById(userId);
  } catch (e) {
    console.error('Error finding user:', e);
    return res.status(401).json({
      message: i18next.t('verificationError.token'),
    });
  }

  if (!user) {
    return res.status(401).json({
      message: i18next.t('verificationError.token'),
    });
  }

  if (user.emailVerifiedAt) {
    return res.status(409).json({
      message: i18next.t('verificationError.email.verified'),
    });
  }

  try {
    await EmailVerification.deleteOne({ userId });
  } catch (e) {
    console.error('Error deleting phone number verification:', e);
    return res.status(401).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

  try {
    await sendVerificationMail(user);
  } catch (e) {
    console.error('Error sending verification mail:', e);
    return res.status(500).json({
      message: i18next.t('httpError.500'),
    });
  }

  return res.status(201).json({
    message: i18next.t('verification.email', { email: user.email }),
    data: {
      userId: user.id,
    },
  });
};
