import 'dotenv/config';
import { init } from '../src/config/database';
import Post, { PostDocument } from '../src/models/Post';
import User, { UserDocument } from '../src/models/User';
import { name, internet, date, lorem } from 'faker';
import { hash } from 'bcrypt';
import Comment from '../src/models/Comment';
import ReactionModel from '../src/models/Reaction';

const clear = async () => {
  await Post.deleteMany({});
  await User.deleteMany({});
  Post;
};

const getRandomUser = async () => {
  const count = await User.countDocuments();
  const skip = Math.floor(Math.random() * count);
  const user = await User.findOne({}).skip(skip).exec();
  if (!user) throw Error('No users in db.');
  return user;
};

const getRandomPost = async () => {
  const count = await Post.countDocuments();
  const skip = Math.floor(Math.random() * count);
  const post = await Post.findOne({}).skip(skip).exec();
  if (!post) throw Error('No posts in db.');
  return post;
};

const seedReaction = async (
  post: PostDocument | undefined = undefined,
  user: UserDocument | undefined = undefined
) => {
  if (!user) user = await getRandomUser();
  if (!post) post = await getRandomPost();

  const reaction = new ReactionModel({
    userId: user.id,
    postId: post.id,
    content: lorem.sentence(),
  });

  await reaction.save();

  post.reactionIds.push(reaction.id);
  await post.save();

  user.reactionIds.push(reaction.id);
  await user.save();

  return reaction.id;
};

const seedReactions = async (
  size: number = 10,
  post: PostDocument | undefined = undefined,
  user: UserDocument | undefined = undefined
): Promise<string[]> => {
  const reactionIds = await Promise.all(
    Array(size)
      .fill(0)
      .map(async () => await seedReaction(post, user))
  );
  console.log(`${size} reactions created.`);
  return reactionIds;
};

const seedComment = async (
  post: PostDocument | undefined = undefined,
  user: UserDocument | undefined = undefined
): Promise<string> => {
  if (!user) user = await getRandomUser();
  if (!post) post = await getRandomPost();

  const comment = new Comment({
    userId: user.id,
    postId: post.id,
    content: lorem.sentence(),
  });

  await comment.save();

  post.commentIds.push(comment.id);
  await post.save();

  user.commentIds.push(comment.id);
  await user.save();

  return comment.id;
};

const seedComments = async (
  size: number = 10,
  post: PostDocument | undefined = undefined,
  user: UserDocument | undefined = undefined
): Promise<string[]> => {
  const commentIds = await Promise.all(
    Array(size)
      .fill(0)
      .map(async () => await seedComment(post, user))
  );
  console.log(`${size} comments created.`);
  return commentIds;
};

const seedPost = async (
  user: UserDocument | undefined = undefined
): Promise<string> => {
  if (!user) {
    user = await getRandomUser();
  }

  const post = new Post({
    userId: user.id,
    privacy: 0,
    content: lorem.paragraph(10),
  });

  await post.save();

  user.postIds.push(post.id);
  await user.save();

  return post.id;
};

const seedPosts = async (
  size: number = 10,
  user: UserDocument | undefined = undefined
): Promise<string[]> => {
  const postIds = await Promise.all(
    Array(size)
      .fill(0)
      .map(async () => await seedPost(user))
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

  await user.save();

  return user.id;
};

const seedUsers = async (size: number = 10) => {
  const userIds = await Promise.all(Array(size).fill(0).map(seedUser));
  console.log(`${size} users created.`);
  return userIds;
};

const seed = async (models: string[]) => {
  if (models.length === 0) {
    await seedUsers();
    await seedPosts();
    await seedComments();
  } else {
    if (models.includes('user')) {
      await seedUsers();
    }

    if (models.includes('post')) {
      await seedPosts();
    }

    if (models.includes('comment')) {
      await seedComments();
    }
  }
};

const run = async () => {
  const [cmd, ...models] = process.argv.slice(2);
  await init();
  switch (cmd) {
    case 'clean':
      await clear();
      break;
    case 'seed':
      await seed(models);
      break;
    case 'refresh':
      await clear();
      await seed(models);
      break;
    default:
      console.log(`Unknown argument: ${cmd}`);
  }
  process.exit(0);
};

run();
