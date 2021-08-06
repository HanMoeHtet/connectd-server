import { lorem } from 'faker';
import { PostDocument } from '@src/resources/post/post.model';
import ReactionModel, {
  ReactionType,
} from '@src/resources/reaction/reaction.model';
import { UserDocument } from '@src/resources/user/user.model';
import { getRandomUser } from '../user/user.factory';
import { getRandomPost } from '../post/post.factory';
import { ClientSession } from 'mongoose';

interface SeedReactionInPostOptions {
  session: ClientSession | null;
  post?: PostDocument;
  user?: UserDocument;
  userCount?: number;
  postCount?: number;
}
export const seedReactionInPost = async ({
  session = null,
  post,
  postCount,
  user,
  userCount,
}: SeedReactionInPostOptions) => {
  if (!user) user = await getRandomUser({ session, count: userCount });
  if (!post) post = await getRandomPost({ session, count: postCount });

  const reactionTypes = Object.values(ReactionType);

  const randomReactionType =
    reactionTypes[Math.floor(Math.random() * reactionTypes.length)];

  const reaction = new ReactionModel({
    userId: user.id,
    sourceType: 'Post',
    sourceId: post.id,
    type: randomReactionType,
  });

  await reaction.save({ session });

  post.reactionIds.push(reaction.id);
  console.log(post);
  await post.save({ session });

  user.reactionIds.push(reaction.id);
  await user.save({ session });

  return reaction.id;
};

interface SeedReactionsInPostOptions {
  session: ClientSession | null;
  size: number;
  post?: PostDocument;
  postCount?: number;
  user?: UserDocument;
  userCount?: number;
}
export const seedReactionsInPost = async ({
  session = null,
  size = 10,
  post,
  postCount,
  user,
  userCount,
}: SeedReactionsInPostOptions): Promise<string[]> => {
  const reactionIds = await Promise.all(
    Array(size)
      .fill(0)
      .map(
        async () =>
          await seedReactionInPost({
            session,
            post,
            user,
            postCount,
            userCount,
          })
      )
  );
  console.log(`${size} reactions created.`);
  return reactionIds;
};

export const clearReactions = async (session: ClientSession | null = null) => {
  await ReactionModel.deleteMany({}).session(session);
};
