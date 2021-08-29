import { ClientSession } from 'mongoose';
import FriendRequestModel from './friend-request.model';

export const clearFriendRequests = async (
  session: ClientSession | null = null
) => {
  await FriendRequestModel.deleteMany({}).session(session);
};
