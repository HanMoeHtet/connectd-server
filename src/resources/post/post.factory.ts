import { lorem } from 'faker';
import { UserDocument } from '@src/resources/user/user.model';
import Post, { PostType } from '@src/resources/post/post.model';
import { getRandomUser } from '../user/user.factory';
import { ClientSession } from 'mongoose';

export const seedPost = async (
  session: ClientSession | null = null,
  user: UserDocument | undefined = undefined
): Promise<string> => {
  if (!user) {
    user = await getRandomUser(session);
  }

  const post = new Post({
    userId: user.id,
    type: PostType.POST,
    privacy: 0,
    content: lorem.paragraph(10),
  });

  await post.save({ session });

  user.postIds.push(post.id);
  await user.save({ session });

  return post.id;
};

export const seedPosts = async (
  session: ClientSession | null = null,
  size: number = 10,
  user: UserDocument | undefined = undefined
): Promise<string[]> => {
  const postIds = await Promise.all(
    Array(size)
      .fill(0)
      .map(async () => await seedPost(session, user))
  );
  console.log(`${size} posts created.`);
  return postIds;
};

export const getRandomPost = async (session: ClientSession | null = null) => {
  const count = await Post.countDocuments();
  const skip = Math.floor(Math.random() * count);
  const post = await Post.findOne({}).skip(skip).session(session).exec();
  if (!post) throw Error('No posts in db.');
  return post;
};

export const clearPosts = async (session: ClientSession | null = null) => {
  await Post.deleteMany({ type: PostType.POST }).session(session);
};
