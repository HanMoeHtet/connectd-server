import {
  BAD_REQUEST,
  CONFLICT,
  OTP_EXPIRATION_IN_MS,
  SERVER_ERROR,
  SUCCESS,
  UNAUTHORIZED,
} from '@src/constants';
import PhoneNumberVerification from '@src/resources/phone-number-verification/phone-number-verification';
import UnverifiedUser from '@src/resources/models/UnverifiedUser';
import User from '@src/resources/models/User';
import i18next from '@src/services/i18next';
import { sendOTP } from '@src/services/sms';
import { compare } from 'bcrypt';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';

export const verify = async (
  req: Request<null, null, { otp: string; userId: string }, null>,
  res: Response
) => {
  const { otp, userId } = req.body;

  if (!otp || !userId) {
    return res.status(BAD_REQUEST).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

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

  let phoneNumberVerification;

  try {
    phoneNumberVerification = await PhoneNumberVerification.findOne({
      userId,
    });
  } catch (e) {
    console.error('Error finding phone number verification:', e);
    return res.status(BAD_REQUEST).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

  if (!phoneNumberVerification) {
    return res.status(BAD_REQUEST).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

  const expiredTime =
    phoneNumberVerification.createdAt.getTime() + OTP_EXPIRATION_IN_MS;

  if (expiredTime < Date.now()) {
    phoneNumberVerification.delete();
    return res.status(BAD_REQUEST).json({
      message: i18next.t('verificationError.otp.expired', {
        date: new Date(expiredTime),
      }),
    });
  }

  if (!(await compare(otp, phoneNumberVerification.hash))) {
    return res.status(UNAUTHORIZED).json({
      message: i18next.t('verificationError.otp.incorrect'),
    });
  }

  const verifiedUser = new User({
    ...user.toJSON(),
  });

  await user.delete();
  await phoneNumberVerification.delete();

  verifiedUser.phoneNumberVerifiedAt = new Date();
  await verifiedUser.save();

  return res.status(SUCCESS).json({
    data: {
      token: sign({ userId: user.id }, process.env.APP_SECRET!),
    },
  });
};

export const resend = async (
  req: Request<null, null, { userId: string }, null>,
  res: Response
) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(BAD_REQUEST).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

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
    await PhoneNumberVerification.deleteOne({ userId });
  } catch (e) {
    console.error('Error deleting phone number verification:', e);
    return res.status(BAD_REQUEST).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

  try {
    await sendOTP(user);
  } catch (e) {
    console.error('Error sending OTP:', e);
    return res.status(SERVER_ERROR).json({
      message: i18next.t('httpError.500'),
    });
  }

  return res.status(SUCCESS).json({
    message: i18next.t('verificationSuccess.sms', {
      phoneNumber: user.phoneNumber,
    }),
  });
};
