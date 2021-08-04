import { UserDocument } from '@src/resources/user/user.model';

export const prepareProfileResponse = (user: UserDocument) => {
  const { _id, username, avatar, email, phoneNumber, birthday, pronouns } =
    user;

  return {
    _id,
    username,
    avatar,
    email,
    phoneNumber,
    birthday,
    pronouns,
  };
};

export const prepareBasicProfileResponse = (user: UserDocument) => {
  const { _id, username, avatar } = user;

  return {
    _id,
    username,
    avatar,
  };
};
