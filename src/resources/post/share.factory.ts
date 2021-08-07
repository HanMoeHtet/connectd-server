import { lorem } from 'faker';
import PostModel, {
  PostDocument,
  PostType,
} from '@src/resources/post/post.model';
import { UserDocument } from '@src/resources/user/user.model';
import { getRandomUser } from '../user/user.factory';
import { getRandomPost } from '../post/post.factory';
import { ClientSession } from 'mongoose';

interface SeedShareOptions {
  session: ClientSession | null;
  post?: PostDocument;
  user?: UserDocument;
  postCount?: number;
  userCount?: number;
}
export const seedShare = async ({
  session = null,
  post,
  user,
  postCount,
  userCount,
}: SeedShareOptions) => {
  if (!user) user = await getRandomUser({ session, count: userCount });
  if (!post) post = await getRandomPost({ session, count: postCount });

  const sharedPost = new PostModel({
    userId: user.id,
    sourceId: post.id,
    type: PostType.SHARE,
    privacy: 'PUBLIC',
    content: lorem.paragraph(10),
  });

  await sharedPost.save({ session });

  post.shareCount++;
  post.shareIds.push(sharedPost.id);
  await post.save({ session });

  user.postIds.push(sharedPost.id);
  await user.save({ session });

  return sharedPost.id;
};

interface SeedSharesOptions {
  session: ClientSession | null;
  size: number;
  post?: PostDocument;
  user?: UserDocument;
  postCount?: number;
  userCount?: number;
}
export const seedShares = async ({
  session = null,
  size = 10,
  post,
  user,
  postCount,
  userCount,
}: SeedSharesOptions): Promise<string[]> => {
  const shareIds = [];

  for (let i = 0; i < size; i++) {
    const shareId = await seedShare({
      session,
      post,
      user,
      postCount,
      userCount,
    });
    shareIds.push(shareId);
  }

  console.log(`${size} shares created.`);
  return shareIds;
};

export const clearShares = async (session: ClientSession | null = null) => {
  await PostModel.deleteMany({ type: PostType.SHARE }).session(session);
};
