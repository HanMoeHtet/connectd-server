import { User } from '@src/models/User';

export const prepareUserResponse = (user: User) => {
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
