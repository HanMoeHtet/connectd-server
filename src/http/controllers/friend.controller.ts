import { MAX_POSTS_PER_PAGE, SERVER_ERROR, SUCCESS } from '@src/constants';
import FriendRequestModel from '@src/resources/friend-request/friend-request.model';
import FriendModel from '@src/resources/friend/friend.model';
import NotificationModel, {
  NotificationType,
} from '@src/resources/notification/notification.model';
import i18next from '@src/services/i18next';
import { Request } from '@src/types/requests';
import { AuthResponse } from '@src/types/responses';
import {
  canAcceptFriendRequest,
  canCancelFriendRequest,
  canCreateFriendRequest,
  canRejectFriendRequest,
  canUnfriend,
  deleteFriendRequestHelper,
  findFriend,
  findFriendRequest,
} from '@src/utils/friend';
import { findFriendRequestReceivedNotificationByFriendRequestId } from '@src/utils/notification';
import { emit as emitFriendRequestAccepted } from '@src/ws/emitters/friend-request-accepted.emitter';
import { emit as emitFriendRequestReceived } from '@src/ws/emitters/friend-request-received.emitter';
import { NextFunction } from 'express';
import { RequestError } from '../error-handlers/handler';
import { findUser } from './user.controller';

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

  let responseFriends;

  try {
    responseFriends = await Promise.all(
      friends.map(async (friend) => {
        console.log(friend);
        if (!friend.user) {
          throw new RequestError(SERVER_ERROR, i18next.t('httpError.500'));
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
  } catch (e) {
    next(e);
    return;
  }

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
  const authUser = res.locals.user;

  let user;
  try {
    user = await findUser(userId);
  } catch (e) {
    next(e);
    return;
  }

  try {
    await canCreateFriendRequest(authUser, user);
  } catch (e) {
    next(e);
    return;
  }

  const friendRequest = new FriendRequestModel({
    senderId: authUser._id,
    receiverId: userId,
  });

  await friendRequest.save();

  authUser.sentFriendRequestIds.push(friendRequest._id);
  await authUser.save();

  user.receivedFriendRequestIds.push(friendRequest._id);
  await user.save();

  res.status(SUCCESS).end();

  const notification = new NotificationModel({
    type: NotificationType.FRIEND_REQUEST_RECEIVED,
    friendRequestId: friendRequest._id,
    createdAt: friendRequest.createdAt,
  });

  await notification.save();

  user.notificationIds.push(notification._id);
  await user.save();

  emitFriendRequestReceived({
    _id: notification._id,
    hasBeenRead: notification.hasBeenRead,
    hasBeenSeen: notification.hasBeenSeen,
    type: NotificationType.FRIEND_REQUEST_RECEIVED,
    friendRequest: {
      _id: friendRequest._id,
      receiver: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
      },
      sender: {
        _id: authUser._id,
        username: authUser.username,
        avatar: authUser.avatar,
      },
      createdAt: friendRequest.createdAt,
    },
    createdAt: notification.createdAt,
  });
};

interface CancelFriendRequestRequest
  extends Request<{
    params: {
      friendRequestId?: string;
    };
  }> {}

export const cancelFriendRequest = async (
  req: CancelFriendRequestRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { friendRequestId } = req.params;
  const authUser = res.locals.user;

  let friendRequest;

  try {
    friendRequest = await findFriendRequest(friendRequestId);
  } catch (e) {
    next(e);
    return;
  }

  try {
    await canCancelFriendRequest(authUser, friendRequest);
  } catch (e) {
    next(e);
    return;
  }

  try {
    await deleteFriendRequestHelper(friendRequest);
  } catch (e) {
    next(e);
    return;
  }

  res.status(SUCCESS).end();
};

interface AcceptFriendRequestRequest
  extends Request<{
    params: {
      friendRequestId?: string;
    };
  }> {}
export const acceptFriendRequest = async (
  req: AcceptFriendRequestRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { friendRequestId } = req.params;

  let friendRequest;

  let authUser = res.locals.user;

  try {
    friendRequest = await findFriendRequest(friendRequestId);
  } catch (e) {
    next(e);
    return;
  }

  try {
    await canAcceptFriendRequest(authUser, friendRequest);
  } catch (e) {
    next(e);
    return;
  }

  friendRequest = await friendRequest
    .populate({
      path: 'sender',
      select: {
        friendIds: 1,
        sentFriendRequestIds: 1,
        username: 1,
        avatar: 1,
        notificationIds: 1,
      },
    })
    .populate({
      path: 'receiver',
      select: {
        friendIds: 1,
        receivedFriendRequestIds: 1,
        username: 1,
        avatar: 1,
      },
    })
    .execPopulate();

  if (!friendRequest.sender || !friendRequest.receiver) {
    next(new RequestError(SERVER_ERROR, i18next.t('httpError.500')));
    return;
  }

  const createdAt = new Date();
  let friend = new FriendModel({
    userIds: [friendRequest.senderId, friendRequest.receiverId],
    createdAt,
  });
  await friend.save();

  const sender = friendRequest.sender;
  sender.sentFriendRequestIds.splice(
    sender.sentFriendRequestIds.indexOf(friendRequest._id),
    1
  );
  sender.friendIds.push(friend._id);
  await sender.save();

  const receiver = friendRequest.receiver;
  receiver.receivedFriendRequestIds.splice(
    receiver.receivedFriendRequestIds.indexOf(friendRequest._id),
    1
  );
  receiver.friendIds.push(friend._id);
  await receiver.save();

  await friendRequest.delete();

  res.status(SUCCESS).end();

  const notification = new NotificationModel({
    type: NotificationType.FRIEND_REQUEST_ACCEPTED,
    createdAt,
  });

  await notification.save();

  sender.notificationIds.push(notification._id);
  await sender.save();

  emitFriendRequestAccepted({
    _id: notification._id,
    hasBeenRead: notification.hasBeenRead,
    hasBeenSeen: notification.hasBeenSeen,
    type: NotificationType.FRIEND_REQUEST_ACCEPTED,
    friendRequest: {
      _id: friendRequest._id,
      sender: {
        _id: sender._id,
        username: sender.username,
        avatar: sender.avatar,
      },
      receiver: {
        _id: receiver._id,
        username: receiver.username,
        avatar: receiver.avatar,
      },
      createdAt: friendRequest.createdAt,
    },
    createdAt: notification.createdAt,
  });
};

interface RejectFriendRequestRequest
  extends Request<{
    params: {
      friendRequestId?: string;
    };
  }> {}
export const rejectFriendRequest = async (
  req: RejectFriendRequestRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { friendRequestId } = req.params;

  let friendRequest;

  const authUser = res.locals.user;

  try {
    friendRequest = await findFriendRequest(friendRequestId);
  } catch (e) {
    next(e);
    return;
  }

  try {
    await canRejectFriendRequest(authUser, friendRequest);
  } catch (e) {
    next(e);
    return;
  }

  try {
    await deleteFriendRequestHelper(friendRequest);
  } catch (e) {
    next(e);
    return;
  }

  res.status(SUCCESS).end();
};

interface UnfriendRequest
  extends Request<{
    params: {
      friendId?: string;
    };
  }> {}
export const unfriend = async (
  req: UnfriendRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { friendId } = req.params;

  let authUser = res.locals.user;

  let friend;
  try {
    friend = await findFriend(friendId);
  } catch (e) {
    next(e);
    return;
  }

  try {
    await canUnfriend(authUser, friend);
  } catch (e) {
    next(e);
    return;
  }

  friend = await friend
    .populate({
      path: 'user',
      select: {
        friendIds: 1,
      },
    })
    .execPopulate();

  if (!friend.user) {
    next(new RequestError(SERVER_ERROR, i18next.t('httpError.500')));
    return;
  }

  authUser.friendIds.splice(authUser.friendIds.indexOf(friend._id));
  await authUser.save();
  await friend.delete();

  const friendUser = friend.user;
  friendUser.friendIds.splice(friendUser.indexOf(friend._id));
};
