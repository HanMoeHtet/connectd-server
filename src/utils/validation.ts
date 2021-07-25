import {
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_AGE,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from '@src/constants';
import User from '@src/models/User';
import i18next from '@src/services/i18next';
import { validatePhoneNumber as validateNationalNumber } from '@src/services/sms';
import {
  EmailRegistrationFormData,
  PhoneNumberRegistrationFormData,
  Pronouns,
  RegistrationError,
  RegistrationFormData,
} from '@src/types';

export const checkIfUsernameExists = async (username: string) => {
  const user = await User.findOne({ username });

  return Boolean(user);
};

export const validateUsername = async (
  username: string | undefined
): Promise<string[]> => {
  const field = 'username';

  if (!username) {
    return [i18next.t('validationError.required', { field })];
  }

  if (
    username.length < MIN_USERNAME_LENGTH ||
    username.length > MAX_USERNAME_LENGTH
  ) {
    return [
      i18next.t('validationError.length', {
        min: MIN_USERNAME_LENGTH,
        max: MAX_USERNAME_LENGTH,
        field,
      }),
    ];
  }

  const regex = /^[a-zA-Z ]+$/;
  if (!regex.test(username)) {
    return [i18next.t('validationError.invalid_username', { field })];
  }

  if (await checkIfUsernameExists(username)) {
    return [i18next.t('validationError.exists', { field })];
  }

  return [];
};

export const checkIfEmailExists = async (email: string) => {
  const user = await User.findOne({ email });
  return Boolean(user);
};

export const validateEmail = async (email: string): Promise<string[]> => {
  const field = 'email';

  if (!email) {
    return [i18next.t('validationError.required', { field })];
  }

  if (await checkIfEmailExists(email)) {
    return [i18next.t('validationError.exists', { field })];
  }

  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!regex.test(email)) {
    return [i18next.t('validationError.format', { field })];
  }

  return [];
};

export const checkIfPhoneNumberExists = async (phoneNumber: string) => {
  const user = await User.findOne({ phoneNumber });
  return Boolean(user);
};

export const validatePhoneNumber = async (
  phoneNumber: string
): Promise<string[]> => {
  const field = 'phone number';

  if (!phoneNumber) {
    return [i18next.t('validationError.required', { field })];
  }

  if (await checkIfPhoneNumberExists(phoneNumber)) {
    return [i18next.t('validationError.exists', { field })];
  }

  const regex =
    /^\+[0-9]{1,3}?[-\s]?\(?[0-9]{3}\)?[-\s]?[0-9]{3}[-\s]?[0-9]{4}$/;
  if (
    !regex.test(phoneNumber) ||
    !(await validateNationalNumber(phoneNumber))
  ) {
    return [i18next.t('validationError.format', { field })];
  }

  return [];
};

export const validatePassword = async (password: string): Promise<string[]> => {
  const field = 'password';

  if (!password) {
    return [i18next.t('validationError.required', { field })];
  }

  if (
    password.length < MIN_PASSWORD_LENGTH &&
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return [
      i18next.t('validationError.length', {
        min: MIN_PASSWORD_LENGTH,
        max: MAX_PASSWORD_LENGTH,
        field,
      }),
    ];
  }

  return [];
};

export const validateBirthday = async (birthday: Date): Promise<string[]> => {
  const field = 'birthday';

  if (!birthday) {
    return [i18next.t('validationError.required', { field })];
  }

  if (isNaN(new Date(birthday).getDate())) {
    return [i18next.t('validationError.invalid', { field })];
  }

  const age = new Date().getFullYear() - new Date(birthday).getFullYear();

  if (age < MIN_AGE) {
    return [i18next.t('validationError.age', { min: MIN_AGE })];
  }
  return [];
};

export const validatePronouns = async (
  pronouns: Pronouns
): Promise<string[]> => {
  const field = 'pronouns';

  if (!pronouns) {
    return [i18next.t('validationError.required_plural', { field })];
  }

  if (typeof pronouns !== 'object') {
    return [i18next.t('validationError.invalid_plural', { field })];
  }

  for (let key in pronouns) {
    if (!pronouns[key as keyof Pronouns]) {
      return [i18next.t('validationError.required_plural', { field })];
    }
  }

  return [];
};

export const validateRegistration = async (
  data: RegistrationFormData
): Promise<RegistrationError> => {
  const errors: RegistrationError = {};

  const { username, password, birthday, pronouns } = data;

  errors.username = await validateUsername(username);

  errors.birthday = await validateBirthday(birthday);

  errors.pronouns = await validatePronouns(pronouns);

  return errors;
};

export const validateEmailRegistration = async (
  data: EmailRegistrationFormData
): Promise<RegistrationError> => {
  const errors: RegistrationError = await validateRegistration(data);

  errors.email = await validateEmail(data.email);

  return errors;
};

export const validatePhoneNumberRegistration = async (
  data: PhoneNumberRegistrationFormData
): Promise<RegistrationError> => {
  const errors: RegistrationError = await validateRegistration(data);

  errors.phoneNumber = await validatePhoneNumber(data.phoneNumber);

  return errors;
};
