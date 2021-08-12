import { lorem } from 'faker';
import { CommentDocument } from '@src/resources/comment/comment.model';
import ReactionModel, {
  ReactionType,
  ReactionSourceType,
} from '@src/resources/reaction/reaction.model';
import User, { UserDocument } from '@src/resources/user/user.model';
import { getRandomUser } from '../user/user.factory';
import { getRandomComment } from '../comment/comment.factory';
import { ClientSession } from 'mongoose';

interface SeedReactionInCommentOptions {
  session: ClientSession | null;
  comment?: CommentDocument;
  user?: UserDocument;
  userCount?: number;
  commentCount?: number;
}
export const seedReactionInComment = async ({
  session = null,
  comment,
  commentCount,
  user,
  userCount,
}: SeedReactionInCommentOptions) => {
  if (!user) user = await getRandomUser({ session, count: userCount });
  if (!comment)
    comment = await getRandomComment({ session, count: commentCount });

  const reactionTypes = Object.values(ReactionType);

  const randomReactionType =
    reactionTypes[Math.floor(Math.random() * reactionTypes.length)]!;

  let reaction = new ReactionModel({
    userId: user._id,
    sourceType: ReactionSourceType.COMMENT,
    sourceId: comment._id,
    type: randomReactionType,
  });

  await reaction.save({ session });

  comment.reactionCounts.set(
    randomReactionType,
    (comment.reactionCounts.get(randomReactionType) || 0) + 1
  );

  comment.reactionIds.push(reaction._id);

  comment.reactions.set(randomReactionType, [
    ...(comment.reactions.get(randomReactionType) || []),
    reaction._id,
  ]);

  await comment.save({ session });

  user.reactionIds.push(reaction._id);
  await user.save({ session });

  return reaction._id;
};

interface SeedReactionsInCommentsOptions {
  session: ClientSession | null;
  size: number;
  comment?: CommentDocument;
  commentCount?: number;
  user?: UserDocument;
  userCount?: number;
}
export const seedReactionsInComments = async ({
  session = null,
  size = 10,
  comment,
  commentCount,
  user,
  userCount,
}: SeedReactionsInCommentsOptions): Promise<string[]> => {
  let reactionIds = [];

  const users = await User.find({}).limit(size);
  size = Math.min(size, users.length);

  for (let i = 0; i < size; i++) {
    if (!user) user = users[i];
    reactionIds.push(
      await seedReactionInComment({
        session,
        comment,
        commentCount,
        user,
        userCount,
      })
    );
  }

  console.log(`${size} reactions in comment created.`);
  return reactionIds;
};

export const clearReactionsInComments = async (
  session: ClientSession | null = null
) => {
  await ReactionModel.deleteMany({
    sourceType: ReactionSourceType.COMMENT,
  }).session(session);
};
