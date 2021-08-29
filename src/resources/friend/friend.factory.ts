import { ClientSession } from 'mongoose';
import FriendModel from './friend.model';

export const clearFriends = async (session: ClientSession | null = null) => {
  await FriendModel.deleteMany({}).session(session);
};
