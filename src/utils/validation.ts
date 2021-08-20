import {
  BAD_REQUEST,
  MAX_CONTENT_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_AGE,
  MIN_CONTENT_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from '@src/constants';
import { ValidationError } from '@src/http/error-handlers/handler';
import { Privacy } from '@src/resources/post/post.model';
import User from '@src/resources/user/user.model';
import i18next from '@src/services/i18next';
import { validatePhoneNumber as validateNationalNumber } from '@src/services/sms';
import {
  CreateCommentError,
  CreateCommentFormData,
  CreatePostError,
  CreatePostFormData,
  CreateReplyError,
  CreateReplyFormData,
  CreateShareError,
  CreateShareFormData,
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

export const validatePrivacy = async (privacy?: string): Promise<string[]> => {
  const field = 'privacy';
  if (!privacy) {
    return [i18next.t('validationError.required', { field })];
  }

  if (!Object.values(Privacy).includes(privacy as Privacy)) {
    return [i18next.t('validationError.invalid', { field })];
  }

  return [];
};

interface ValidateContentOptions {
  minLength?: number;
}
export const validateContent = async (
  content?: string,
  options: ValidateContentOptions = {}
): Promise<string[]> => {
  const field = 'content';

  const { minLength } = options;

  if (content === undefined) {
    return [i18next.t('validationError.required', { field })];
  }

  if (
    content.length <
      (minLength !== undefined ? minLength : MIN_CONTENT_LENGTH) ||
    content.length > MAX_CONTENT_LENGTH
  ) {
    return [
      i18next.t('validationError.length', {
        min: MIN_CONTENT_LENGTH,
        max: MAX_CONTENT_LENGTH,
        field,
      }),
    ];
  }

  return [];
};

export const validateCreatePost = async (
  data: Partial<CreatePostFormData>,
  options: { minContentLength?: number } = {}
): Promise<CreatePostError> => {
  const { minContentLength } = options;

  const errors: CreatePostError = {};

  const { privacy, content } = data;

  errors.privacy = await validatePrivacy(privacy);

  errors.content = await validateContent(content, {
    minLength: minContentLength,
  });

  for (let key in errors) {
    const error = errors[key as keyof CreatePostError];
    if (error && error.length) {
      throw new ValidationError(BAD_REQUEST, errors);
    }
  }

  return errors;
};

export const validateCreateComment = async (
  data: Partial<CreateCommentFormData>,
  options: { minContentLength?: number } = {}
): Promise<CreateCommentError> => {
  const errors: CreateCommentError = {};
  const { minContentLength } = options;

  const { content } = data;

  errors.content = await validateContent(content, {
    minLength: minContentLength,
  });

  for (let key in errors) {
    const error = errors[key as keyof CreateCommentError];
    if (error && error.length) {
      throw new ValidationError(BAD_REQUEST, errors);
    }
  }

  return errors;
};

export const validateCreateReply = async (
  data: Partial<CreateReplyFormData>,
  options: { minContentLength?: number } = {}
): Promise<CreateReplyError> => {
  const errors: CreateReplyError = {};
  const { minContentLength } = options;

  const { content } = data;

  errors.content = await validateContent(content, {
    minLength: minContentLength,
  });

  for (let key in errors) {
    const error = errors[key as keyof CreateReplyError];
    if (error && error.length) {
      throw new ValidationError(BAD_REQUEST, errors);
    }
  }

  return errors;
};

export const validateCreateShare = async (
  data: Partial<CreateShareFormData>
): Promise<CreateShareError> => {
  const errors: CreateShareError = {};

  const { privacy, content } = data;

  errors.privacy = await validatePrivacy(privacy);

  errors.content = await validateContent(content, { minLength: 0 });

  for (let key in errors) {
    const error = errors[key as keyof CreateShareError];
    if (error && error.length) {
      throw new ValidationError(BAD_REQUEST, errors);
    }
  }

  return errors;
};
