import { OTP_EXPIRATION_IN_MS } from '@src/constants';
import PhoneNumberVerification from '@src/models/PhoneNmberVerification';
import User from '@src/models/User';
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
    return res.status(401).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

  let user;
  try {
    user = await User.findById(userId);
  } catch (e) {
    console.error('Error finding user:', e);
    return res.status(401).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

  if (!user) {
    return res.status(401).json({
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
    return res.status(401).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

  if (!phoneNumberVerification) {
    return res.status(401).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

  phoneNumberVerification.delete();

  const expiredTime =
    phoneNumberVerification.createdAt.getTime() + OTP_EXPIRATION_IN_MS;

  if (expiredTime < Date.now()) {
    return res.status(401).json({
      message: i18next.t('verificationError.otp.expired', {
        date: new Date(expiredTime),
      }),
    });
  }

  if (!(await compare(otp, phoneNumberVerification.hash))) {
    return res.status(401).json({
      message: i18next.t('verificationError.otp.incorrect'),
    });
  }

  user.phoneNumberVerifiedAt = new Date();
  await user.save();

  return res.status(200).json({
    token: sign({ userId: user.id }, process.env.APP_SECRET!),
  });
};

export const resend = async (
  req: Request<null, null, { userId: string }, null>,
  res: Response
) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(401).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

  let user;
  try {
    user = await User.findById(userId);
  } catch (e) {
    console.error('Error finding user:', e);
    return res.status(401).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

  if (!user) {
    return res.status(401).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

  if (user.phoneNumberVerifiedAt) {
    return res.status(409).json({
      message: i18next.t('verificationError.phoneNumber.verified'),
    });
  }

  try {
    await PhoneNumberVerification.deleteOne({ userId });
  } catch (e) {
    console.error('Error deleting phone number verification:', e);
    return res.status(401).json({
      message: i18next.t('verificationError.invalid'),
    });
  }

  try {
    await sendOTP(user);
  } catch (e) {
    console.error('Error sending OTP:', e);
    return res.status(500).json({
      message: i18next.t('httpError.500'),
    });
  }

  return res.status(201).json({
    message: i18next.t('verification.sms', {
      phoneNumber: user.phoneNumber,
    }),
    data: {
      userId: user.id,
    },
  });
};
