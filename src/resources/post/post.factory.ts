import { lorem } from 'faker';
import { UserDocument } from '@src/resources/user/user.model';
import Post, { PostType } from '@src/resources/post/post.model';
import { getRandomUser } from '../user/user.factory';
import { ClientSession } from 'mongoose';

interface SeedPostOptions {
  session: ClientSession | null;
  user?: UserDocument;
  userCount?: number;
}
export const seedPost = async ({
  session = null,
  user,
  userCount,
}: SeedPostOptions): Promise<string> => {
  if (!user) {
    user = await getRandomUser({ session, count: userCount });
  }

  const post = new Post({
    userId: user.id,
    type: PostType.POST,
    privacy: 'PUBLIC',
    content: lorem.paragraph(10),
  });

  await post.save({ session });

  user.postIds.push(post.id);
  await user.save({ session });

  return post.id;
};

interface SeedPostsOptions {
  session: ClientSession | null;
  size: number;
  user?: UserDocument;
  userCount?: number;
}
export const seedPosts = async ({
  session = null,
  size = 10,
  user,
  userCount,
}: SeedPostsOptions): Promise<string[]> => {
  const postIds = [];

  for (let i = 0; i < size; i++) {
    postIds.push(await seedPost({ session, user, userCount }));
  }

  console.log(`${size} posts created.`);
  return postIds;
};

interface GetRandomPostOptions {
  session: ClientSession | null;
  count: number | undefined;
}
export const getRandomPost = async ({
  session = null,
  count,
}: GetRandomPostOptions) => {
  if (!count) count = await Post.countDocuments().session(session);
  const skip = Math.floor(Math.random() * count);
  const post = await Post.findOne({}).skip(skip).session(session).exec();
  if (!post) throw Error('No posts in db.');
  return post;
};

export const clearPosts = async (session: ClientSession | null = null) => {
  await Post.deleteMany({ type: PostType.POST }).session(session);
};
