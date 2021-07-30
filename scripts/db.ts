import 'dotenv/config';
import { init } from '../src/config/database';
import Post from '../src/models/Post';
import User from '../src/models/User';
import { name, internet, date, lorem } from 'faker';
import { hash } from 'bcrypt';

const clear = async () => {
  await Post.deleteMany({});
  await User.deleteMany({});
  Post;
};

const seedPost = async (userId: string): Promise<string> => {
  const post = new Post({
    userId,
    privacy: 0,
    content: lorem.paragraph(10),
  });

  await post.save();
  return post.id;
};

const seedPosts = async (
  size: number = 20,
  userId: string
): Promise<string[]> => {
  const postIds = await Promise.all(
    Array(size)
      .fill(0)
      .map(async () => await seedPost(userId))
  );
  console.log(`${size} posts created.`);
  return postIds;
};

const seedUser = async (): Promise<string> => {
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

  user.postIds = await seedPosts(10, user.id);

  await user.save();

  return user.id;
};

const seedUsers = async (size: number = 10) => {
  const userIds = await Promise.all(Array(size).fill(0).map(seedUser));
  console.log(`${size} users created.`);
  return userIds;
};

const run = async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  await init();
  switch (cmd) {
    case 'clean':
      await clear();
      break;
    case 'seed':
      await seedUsers(10);
      break;
    case 'refresh':
      await clear();
      await seedUsers(10);
      break;
    default:
      console.log(`Unknown argument: ${cmd}`);
  }
  process.exit(0);
};

run();
