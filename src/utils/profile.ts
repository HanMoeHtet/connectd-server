import { UserDocument } from '@src/models/User';

export const prepareProfileResponse = (user: UserDocument) => {
  const { id, username, avatar, email, phoneNumber, birthday, pronouns } = user;

  return {
    id,
    username,
    avatar,
    email,
    phoneNumber,
    birthday,
    pronouns,
  };
};

export const prepareBasicProfileResponse = (user: UserDocument) => {
  const { id, username, avatar } = user;

  return {
    id,
    username,
    avatar,
  };
};
