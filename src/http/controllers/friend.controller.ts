import FriendRequestModel from '@src/resources/friend/friend-request.model';
import { Request } from '@src/types/requests';
import { AuthResponse } from '@src/types/responses';
import { NextFunction } from 'express';
import { findUser } from './user.controller';
import { emit as emitFriendRequestReceived } from '@src/ws/emitters/friend-request-received.emitter';
import { MAX_POSTS_PER_PAGE, SUCCESS } from '@src/constants';
import NotificationModel from '@src/resources/notification/notification.model';

interface GetFriendsByUserRequest
  extends Request<{
    params: {
      userId?: string;
    };
    query: {
      limit?: string;
      lastFriendId?: string;
    };
  }> {}
export const getFriendsByUser = async (
  req: GetFriendsByUserRequest,
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

  const { limit, lastFriendId } = req.query;

  const _limit = Math.min(
    Number(limit) || MAX_POSTS_PER_PAGE,
    MAX_POSTS_PER_PAGE
  );

  const extraQuery = lastFriendId ? { _id: { $lt: lastFriendId } } : {};

  const populateOptions = {
    path: 'friends',
    match: {
      ...extraQuery,
    },
    options: {
      sort: { createdAt: -1 },
      limit: _limit,
    },
    populate: {
      path: 'user',
      select: {
        username: 1,
        avatar: 1,
        friendIds: 1,
      },
    },
  };

  user = await user.populate(populateOptions).execPopulate();

  const authUser = res.locals.user;

  const friends = user.friends || [];

  const lastFriend = friends[friends.length - 1];
  const hasMore = user.friendIds.some(
    (friendId) => lastFriend && friendId < lastFriend._id
  );

  const responseFriends = await Promise.all(
    friends.map(async (friend) => {
      console.log(friend);
      if (!friend.user) {
        // TODO: return error response;
        console.trace();
        throw new Error('not implemented');
      }

      const areUsersFriends = friend.user.friendIds.includes(authUser._id);

      const { friendIds, ...rest } = friend.user.toJSON();

      const responseFriend = {
        ...friend.toObject(),
        user: rest,
      };

      return {
        ...responseFriend,
        areUsersFriends,
      };
    })
  );

  res.status(SUCCESS).json({
    data: {
      friends: responseFriends,
      hasMore,
    },
  });
};

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

  const notification = new NotificationModel({
    friendRequestId: friendRequest._id,
    createdAt: friendRequest.createdAt,
  });

  await notification.save();

  emitFriendRequestReceived({
    _id: notification._id,
    isRead: notification.isRead,
    friendRequest: {
      _id: friendRequest._id,
      receiverId: user._id,
      sender: {
        _id: authUser._id,
        username: authUser.username,
        avatar: authUser.avatar,
      },
      createdAt: friendRequest.createdAt,
    },
    createdAt: notification.createdAt,
  });

  res.status(SUCCESS).end();
};
