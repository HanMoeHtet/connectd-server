import { ClientSession } from 'mongoose';
import ReplyModel from './reply.model';

export const clearReplies = async (session: ClientSession | null = null) => {
  await ReplyModel.deleteMany({}).session(session);
};
