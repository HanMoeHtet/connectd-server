import { BAD_REQUEST, BCRYPT_ROUNDS } from '@src/constants';
import UnverifiedUser from '@src/resources/unverified-user/unverified-user.model';
import i18next from '@src/services/i18next';
import { sendOTP } from '@src/services/sms';
import { PhoneNumberRegistrationFormData, RegistrationError } from '@src/types';
import { validatePhoneNumberRegistration } from '@src/utils/validation';
import { hash } from 'bcrypt';
import { Request, Response } from 'express';

export const register = async (
  req: Request<null, null, PhoneNumberRegistrationFormData, null>,
  res: Response
) => {
  const errors = await validatePhoneNumberRegistration(req.body);

  for (let key in errors) {
    const error = errors[key as keyof RegistrationError];
    if (error && error.length) {
      return res.status(400).json({
        errors,
      });
    }
  }

  const { username, phoneNumber, password, birthday, pronouns } = req.body;

  let hashedPassword;

  try {
    hashedPassword = await hash(password, BCRYPT_ROUNDS);
  } catch (e) {
    return res.status(BAD_REQUEST).json({
      errors: {
        password: i18next.t('validationError.invalid', { field: 'password' }),
      },
    });
  }

  await UnverifiedUser.deleteOne({ phoneNumber });

  const newUser = new UnverifiedUser({
    username,
    phoneNumber,
    password: hashedPassword,
    birthday,
    pronouns,
  });

  try {
    await newUser.save();
  } catch (e) {
    console.error('Error saving user:', e);
    return res.status(500).json({
      message: i18next.t('httpError.500'),
    });
  }

  try {
    await sendOTP(newUser);
  } catch (e) {
    console.error('Error sending OTP:', e);
    return res.status(500).json({
      message: i18next.t('httpError.500'),
    });
  }

  return res.status(201).json({
    message: i18next.t('verificationSuccess.sms', {
      phoneNumber: newUser.phoneNumber,
    }),
    data: {
      userId: newUser.id,
    },
  });
};
