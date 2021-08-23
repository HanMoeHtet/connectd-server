import FriendRequestModel from '@src/resources/friend/friend-request.model';
import { Request } from '@src/types/requests';
import { AuthResponse } from '@src/types/responses';
import { NextFunction } from 'express';
import { findUser } from './user.controller';

interface SendFriendRequestRequest
  extends Request<{
    params: {
      userId?: string;
    };
  }> {}
export const createFriendRequest = async (
  req: SendFriendRequestRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { userId } = req.params;

  let user;

  try {
    user = await findUser(userId);
  } catch (e) {
    next(e);
    return;
  }

  const authUser = res.locals.user;

  const friendRequest = new FriendRequestModel({
    senderId: authUser._id,
    receiverId: userId,
  });

  await friendRequest.save();

  user.friendRequestIds.push(friendRequest._id);
  await user.save();
};
