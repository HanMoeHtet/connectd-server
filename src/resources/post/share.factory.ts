import { lorem } from 'faker';
import PostModel, {
  PostDocument,
  PostType,
} from '@src/resources/post/post.model';
import { UserDocument } from '@src/resources/user/user.model';
import { getRandomUser } from '../user/user.factory';
import { getRandomPost } from '../post/post.factory';
import { ClientSession } from 'mongoose';

export const seedShare = async (
  session: ClientSession | null = null,
  post: PostDocument | undefined = undefined,
  user: UserDocument | undefined = undefined
) => {
  if (!user) user = await getRandomUser(session);
  if (!post) post = await getRandomPost(session);

  const sharedPost = new PostModel({
    userId: user.id,
    type: PostType.SHARE,
    privacy: 0,
    content: lorem.paragraph(10),
  });

  await sharedPost.save({ session });

  post.shareIds.push(sharedPost.id);
  await post.save({ session });

  user.postIds.push(sharedPost.id);
  await user.save({ session });

  return sharedPost.id;
};

export const seedShares = async (
  session: ClientSession | null = null,
  size: number = 10,
  post: PostDocument | undefined = undefined,
  user: UserDocument | undefined = undefined
): Promise<string[]> => {
  const shareIds = await Promise.all(
    Array(size)
      .fill(0)
      .map(async () => await seedShare(session, post, user))
  );
  console.log(`${size} shares created.`);
  return shareIds;
};

export const clearShares = async (session: ClientSession | null = null) => {
  await PostModel.deleteMany({ type: PostType.SHARE }).session(session);
};
