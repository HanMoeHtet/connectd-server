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

const seedPost = async (userId: string) => {
  const post = new Post({
    userId,
    privacy: 0,
    content: lorem.paragraph(10),
  });

  await post.save();
};

const seedPosts = async (size: number = 20) => {
  const userIds = (await User.find({}, { id: true }).exec()).map((u) => u.id);
  await Promise.all(
    Array(size)
      .fill(0)
      .map(async () => {
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        await seedPost(userId);
      })
  );
  console.log(`${size} posts created.`);
};

const seedUser = async () => {
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
  await user.save();
};

const seedUsers = async (size: number = 10) => {
  await Promise.all(Array(size).fill(0).map(seedUser));
  console.log(`${size} users created.`);
};

const run = async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  switch (cmd) {
    case 'clean':
      await clear();
      break;
    case 'seed':
      await seedUsers(10);
      await seedPosts(20);
      break;
    case 'refresh':
      await clear();
      await seedUsers(10);
      await seedPosts(20);
      break;
    default:
      console.log(`Unknown argument: ${cmd}`);
  }
  process.exit(0);
};

run();
