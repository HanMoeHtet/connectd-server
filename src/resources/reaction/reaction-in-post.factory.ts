import { lorem } from 'faker';
import { PostDocument } from '@src/resources/post/post.model';
import ReactionModel, {
  ReactionType,
  ReactionSourceType,
} from '@src/resources/reaction/reaction.model';
import User, { UserDocument } from '@src/resources/user/user.model';
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
    reactionTypes[Math.floor(Math.random() * reactionTypes.length)]!;

  let reaction = new ReactionModel({
    userId: user._id,
    sourceType: ReactionSourceType.POST,
    sourceId: post._id,
    type: randomReactionType,
  });

  await reaction.save({ session });

  post.reactionCounts.set(
    randomReactionType,
    (post.reactionCounts.get(randomReactionType) || 0) + 1
  );

  post.reactionIds.push(reaction._id);

  post.reactions.set(randomReactionType, [
    ...(post.reactions.get(randomReactionType) || []),
    reaction._id,
  ]);

  await post.save({ session });

  user.reactionIds.push(reaction._id);
  await user.save({ session });

  return reaction._id;
};

interface SeedReactionsInPostsOptions {
  session: ClientSession | null;
  size: number;
  post?: PostDocument;
  postCount?: number;
  user?: UserDocument;
  userCount?: number;
}
export const seedReactionsInPosts = async ({
  session = null,
  size = 10,
  post,
  postCount,
  user,
  userCount,
}: SeedReactionsInPostsOptions): Promise<string[]> => {
  let reactionIds = [];

  const users = await User.find({}, null, {
    session: session || undefined,
  }).limit(size);
  size = Math.min(size, users.length);

  for (let i = 0; i < size; i++) {
    if (!user) user = users[i];
    reactionIds.push(
      await seedReactionInPost({
        session,
        post,
        postCount,
        user,
        userCount,
      })
    );
  }

  console.log(`${size} reactions in post created.`);
  return reactionIds;
};

export const clearReactionsInPosts = async (
  session: ClientSession | null = null
) => {
  await ReactionModel.deleteMany({
    sourceType: ReactionSourceType.POST,
  }).session(session);
};
