import User from './user.model';
import { name, internet, date } from 'faker';
import { hash } from 'bcrypt';
import { ClientSession } from 'mongoose';

export const seedUser = async (
  session: ClientSession | null = null
): Promise<string> => {
  const gender = Math.floor(Math.random() * 2);

  const user = new User({
    username: name.findName(undefined, undefined, gender),
    email: internet.email(),
    emailVerifiedAt: date.past(),
    birthday: date.past(),
    hash: await hash('password', 10),
    pronouns: {
      subjective: ['he', 'she'][gender],
      objective: ['him', 'her'][gender],
      possessive: ['his', 'her'][gender],
    },
  });

  await user.save({ session });

  return user.id;
};

export const seedUsers = async (
  session: ClientSession | null = null,
  size: number = 10
) => {
  const userIds = await Promise.all(
    Array(size)
      .fill(0)
      .map(() => seedUser(session))
  );
  console.log(`${size} users created.`);
  return userIds;
};

export const getRandomUser = async (session: ClientSession | null = null) => {
  const count = await User.countDocuments();
  const skip = Math.floor(Math.random() * count);
  const user = await User.findOne({}).skip(skip).session(session).exec();
  if (!user) throw Error('No users in db.');
  return user;
};

export const clearUsers = async (session: ClientSession | null = null) => {
  await User.deleteMany({}).session(session);
};
