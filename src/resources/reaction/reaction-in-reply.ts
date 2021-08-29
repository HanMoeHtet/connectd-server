import { ClientSession } from 'mongoose';
import ReactionModel, { ReactionSourceType } from './reaction.model';

export const clearReactionsInReplies = async (
  session: ClientSession | null = null
) => {
  await ReactionModel.deleteMany({
    sourceType: ReactionSourceType.REPLY,
  }).session(session);
};
