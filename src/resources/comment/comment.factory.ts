import { lorem } from 'faker';
import Comment from '@src/resources/comment/comment.model';
import { PostDocument } from '@src/resources/post/post.model';
import { UserDocument } from '@src/resources/user/user.model';
import { getRandomUser } from '../user/user.factory';
import { getRandomPost } from '../post/post.factory';
import { ClientSession } from 'mongoose';

interface SeedCommentOptions {
  session: ClientSession | null;
  post?: PostDocument;
  postCount?: number;
  user?: UserDocument;
  userCount?: number;
}
export const seedComment = async ({
  session = null,
  post,
  postCount,
  user,
  userCount,
}: SeedCommentOptions): Promise<string> => {
  if (!user) user = await getRandomUser({ session, count: userCount });
  if (!post) post = await getRandomPost({ session, count: postCount });

  const comment = new Comment({
    userId: user._id,
    postId: post._id,
    content: lorem.sentence(),
  });

  await comment.save({ session });

  post.commentCount++;
  post.commentIds.push(comment._id);
  await post.save({ session });

  user.commentIds.push(comment._id);
  await user.save({ session });

  return comment._id;
};

interface SeedCommentsOptions {
  session: ClientSession | null;
  size: number;
  post?: PostDocument;
  user?: UserDocument;
  postCount?: number;
  userCount?: number;
}
export const seedComments = async ({
  session = null,
  size = 10,
  post,
  user,
  postCount,
  userCount,
}: SeedCommentsOptions): Promise<string[]> => {
  const commentIds = await Promise.all(
    Array(size)
      .fill(0)
      .map(
        async () =>
          await seedComment({ session, post, user, postCount, userCount })
      )
  );
  console.log(`${size} comments created.`);
  return commentIds;
};

export const clearComments = async (session: ClientSession | null = null) => {
  await Comment.deleteMany({}).session(session);
};
