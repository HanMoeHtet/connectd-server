import {
  BAD_REQUEST,
  BCRYPT_ROUNDS,
  CREATED,
  SERVER_ERROR,
} from '@src/constants';
import UnverifiedUser from '@src/resources/unverified-user/unverified-user.model';
import i18next from '@src/services/i18next';
import { sendVerificationMail } from '@src/services/mail';
import { EmailRegistrationFormData, RegistrationError } from '@src/types';
import { validateEmailRegistration } from '@src/utils/validation';
import { hash } from 'bcrypt';
import { Request, Response } from 'express';

export const register = async (
  req: Request<null, null, EmailRegistrationFormData, null>,
  res: Response
) => {
  const errors = await validateEmailRegistration(req.body);

  for (let key in errors) {
    const error = errors[key as keyof RegistrationError];
    if (error && error.length) {
      return res.status(BAD_REQUEST).json({
        errors,
      });
    }
  }

  const { username, email, password, birthday } = req.body;

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

  await UnverifiedUser.deleteOne({ email });

  const newUser = new UnverifiedUser({
    username,
    email,
    hash: hashedPassword,
    birthday,
  });

  try {
    await newUser.save();
  } catch (e) {
    console.error('Error saving user:', e);
    return res.status(SERVER_ERROR).json({
      message: i18next.t('httpError.500'),
    });
  }

  try {
    await sendVerificationMail(newUser);
  } catch (e) {
    console.error('Error sending verification mail:', e);
    return res.status(SERVER_ERROR).json({
      message: i18next.t('httpError.500'),
    });
  }

  return res.status(CREATED).json({
    message: i18next.t('verificationSuccess.email', { email: newUser.email }),
    data: {
      userId: newUser._id,
    },
  });
};
