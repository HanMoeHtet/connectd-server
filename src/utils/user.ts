import UserModel, { UserDocument } from '@src/resources/user/user.model';

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

export const filterOnlineUserIds = async (userIds: string[]) => {
  const users = await UserModel.find({
    _id: { $in: userIds },
    lastSeenAt: { $eq: null, $exists: true },
  }).select({ _id: 1 });

  return users.map((user) => String(user._id));
};
