import { lorem } from 'faker';
import { PostDocument } from '@src/resources/post/post.model';
import ReactionModel, {
  ReactionType,
} from '@src/resources/reaction/reaction.model';
import { UserDocument } from '@src/resources/user/user.model';
import { getRandomUser } from '../user/user.factory';
import { getRandomPost } from '../post/post.factory';
import { ClientSession } from 'mongoose';

export const seedReactionInPost = async (
  session: ClientSession | null = null,
  post: PostDocument | undefined = undefined,
  user: UserDocument | undefined = undefined
) => {
  if (!user) user = await getRandomUser(session);
  if (!post) post = await getRandomPost(session);

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
  await post.save({ session });

  user.reactionIds.push(reaction.id);
  await user.save({ session });

  return reaction.id;
};

export const seedReactionsInPost = async (
  session: ClientSession | null = null,
  size: number = 10,
  post: PostDocument | undefined = undefined,
  user: UserDocument | undefined = undefined
): Promise<string[]> => {
  const reactionIds = await Promise.all(
    Array(size)
      .fill(0)
      .map(async () => await seedReactionInPost(session, post, user))
  );
  console.log(`${size} reactions created.`);
  return reactionIds;
};

export const clearReactions = async (session: ClientSession | null = null) => {
  await ReactionModel.deleteMany({}).session(session);
};
