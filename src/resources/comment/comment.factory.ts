import { lorem } from 'faker';
import Comment from '@src/resources/comment/comment.model';
import { PostDocument } from '@src/resources/post/post.model';
import { UserDocument } from '@src/resources/user/user.model';
import { getRandomUser } from '../user/user.factory';
import { getRandomPost } from '../post/post.factory';
import { ClientSession } from 'mongoose';

export const seedComment = async (
  session: ClientSession | null = null,
  post: PostDocument | undefined = undefined,
  user: UserDocument | undefined = undefined
): Promise<string> => {
  if (!user) user = await getRandomUser(session);
  if (!post) post = await getRandomPost(session);

  const comment = new Comment({
    userId: user.id,
    postId: post.id,
    content: lorem.sentence(),
  });

  await comment.save({ session });

  post.commentIds.push(comment.id);
  await post.save({ session });

  user.commentIds.push(comment.id);
  await user.save({ session });

  return comment.id;
};

export const seedComments = async (
  session: ClientSession | null = null,
  size: number = 10,
  post: PostDocument | undefined = undefined,
  user: UserDocument | undefined = undefined
): Promise<string[]> => {
  const commentIds = await Promise.all(
    Array(size)
      .fill(0)
      .map(async () => await seedComment(session, post, user))
  );
  console.log(`${size} comments created.`);
  return commentIds;
};

export const clearComments = async (session: ClientSession | null = null) => {
  await Comment.deleteMany({}).session(session);
};
