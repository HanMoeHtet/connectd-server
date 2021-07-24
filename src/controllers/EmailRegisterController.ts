import { BCRYPT_ROUNDS } from '@src/constants';
import User from '@src/models/User';
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
      return res.status(400).json({
        errors,
      });
    }
  }

  const { username, email, password, birthday, pronouns } = req.body;

  const newUser = new User({
    username,
    email,
    password: await hash(password, BCRYPT_ROUNDS),
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
    await sendVerificationMail(newUser);
  } catch (e) {
    console.error('Error sending verification mail:', e);
    return res.status(500).json({
      message: i18next.t('httpError.500'),
    });
  }

  return res.status(201).json({
    message: i18next.t('verification.email', { email: newUser.email }),
    data: {
      userId: newUser.id,
    },
  });
};
