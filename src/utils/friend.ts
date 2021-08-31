import { BAD_REQUEST, SERVER_ERROR } from '@src/constants';
import { RequestError } from '@src/http/error-handlers/handler';
import FriendRequestModel, {
  FriendRequestDocument,
} from '@src/resources/friend-request/friend-request.model';
import FriendModel, {
  FriendDocument,
} from '@src/resources/friend/friend.model';
import { UserDocument } from '@src/resources/user/user.model';
import i18next from '@src/services/i18next';
import { compareMongooseIds } from './helpers';
import { findFriendRequestReceivedNotificationByFriendRequestId } from './notification';

export interface FriendDocumentWithUser extends FriendDocument {
  user: UserDocument;
}

export const isFriendDocumentWithUser = (
  friend: FriendDocument | FriendDocumentWithUser
): friend is FriendDocumentWithUser => {
  return (friend as FriendDocumentWithUser).user !== undefined;
};

export interface UserDocumentWithFriends extends UserDocument {
  friends: FriendDocumentWithUser[];
}

export const populateUserDocumentWithFriends = async (
  user: UserDocument
): Promise<UserDocumentWithFriends> => {
  if (isUserDocumentWithFriends(user)) {
    return user;
  }

  user = await user
    .populate({
      path: 'friends',
      populate: {
        path: 'user',
        select: {
          _id: 1,
        },
      },
    })
    .execPopulate();

  if (!isUserDocumentWithFriends(user)) {
    throw new RequestError(SERVER_ERROR, i18next.t('httpError.500'));
  }

  return user;
};

export const isUserDocumentWithFriends = (
  user: UserDocument | UserDocumentWithFriends
): user is UserDocumentWithFriends => {
  if ((user as UserDocumentWithFriends).friends === undefined) return false;

  return (user as UserDocumentWithFriends).friends.every(
    isFriendDocumentWithUser
  );
};

export interface UserDocumentWithSentFriendRequests extends UserDocument {
  sentFriendRequests: FriendRequestDocument[];
}

export const populateUserDocumentWithSentFriendRequests = async (
  user: UserDocument
): Promise<UserDocumentWithSentFriendRequests> => {
  user = await user
    .populate({
      path: 'sentFriendRequests',
    })
    .execPopulate();

  return user as UserDocumentWithSentFriendRequests;
};

export interface FriendRequestDocumentWithReceiverAndSender
  extends FriendRequestDocument {
  receiver: UserDocumentWithFriends;
  sender: UserDocumentWithFriends;
}

export const populateFriendRequestDocumentWithReceiverAndSender = async (
  friendRequest:
    | FriendRequestDocument
    | FriendRequestDocumentWithReceiverAndSender
): Promise<FriendRequestDocumentWithReceiverAndSender> => {
  if (isFriendRequestDocumentWithReceiverAndSender(friendRequest)) {
    return friendRequest;
  }

  friendRequest = await friendRequest
    .populate({
      path: 'receiver',
      populate: {
        path: 'friends',
        populate: {
          path: 'user',
          select: {
            _id: 1,
          },
        },
      },
    })
    .populate({
      path: 'sender',
      populate: {
        path: 'friends',
        populate: {
          path: 'user',
          select: {
            _id: 1,
          },
        },
      },
    })
    .execPopulate();

  if (!isFriendRequestDocumentWithReceiverAndSender(friendRequest)) {
    throw new RequestError(SERVER_ERROR, i18next.t('httpError.500'));
  }

  return friendRequest;
};

export const isFriendRequestDocumentWithReceiverAndSender = (
  friendRequest:
    | FriendRequestDocument
    | FriendRequestDocumentWithReceiverAndSender
): friendRequest is FriendRequestDocumentWithReceiverAndSender => {
  if (
    (friendRequest as FriendRequestDocumentWithReceiverAndSender).receiver ===
      undefined ||
    (friendRequest as FriendRequestDocumentWithReceiverAndSender).sender ===
      undefined
  )
    return false;

  return (
    isUserDocumentWithFriends(
      (friendRequest as FriendRequestDocumentWithReceiverAndSender).receiver
    ) &&
    isUserDocumentWithFriends(
      (friendRequest as FriendRequestDocumentWithReceiverAndSender).sender
    )
  );
};

export const findFriendRequest = async (friendRequestId?: string) => {
  if (!friendRequestId) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('missing', { field: 'friendRequestId' })
    );
  }

  let friendRequest;
  try {
    friendRequest = await FriendRequestModel.findById(friendRequestId);
  } catch (err) {
    throw new RequestError(BAD_REQUEST, i18next.t('httpError.500'), err);
  }

  if (!friendRequest) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('notFound', { field: 'friend request' })
    );
  }

  return friendRequest;
};

export const findFriend = async (friendId?: string) => {
  if (!friendId) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('missing', { field: 'friendId' })
    );
  }

  let friend;
  try {
    friend = await FriendModel.findById(friendId);
  } catch (err) {
    throw new RequestError(BAD_REQUEST, i18next.t('httpError.500'), err);
  }

  if (!friend) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('notFound', { field: 'friend' })
    );
  }

  return friend;
};

export const areUsersFriends = (
  userOne: UserDocument,
  userTwo: UserDocument
) => {
  const userOneFriendIds = userOne.friendIds;
  const userTwoFriendIds = userTwo.friendIds;

  return userOneFriendIds.some((friendId) =>
    userTwoFriendIds.includes(String(friendId))
  );
};

export const hasPendingFriendRequest = (
  sender: UserDocumentWithSentFriendRequests,
  receiver: UserDocument
) => {
  return (
    sender.sentFriendRequests.find((sentFriendRequest) =>
      compareMongooseIds(sentFriendRequest.receiverId, receiver._id)
    ) !== undefined
  );
};

export const getPendingFriendRequest = (
  sender: UserDocumentWithSentFriendRequests,
  receiver: UserDocument
) => {
  return sender.sentFriendRequests.find((sentFriendRequest) =>
    compareMongooseIds(sentFriendRequest.receiverId, receiver._id)
  );
};

export const canCreateFriendRequest = async (
  sender: UserDocument,
  receiver: UserDocument
) => {
  if (compareMongooseIds(sender._id, receiver._id)) {
    throw new RequestError(BAD_REQUEST, i18next.t('friendRequest.cantSend'));
  }

  if (areUsersFriends(sender, receiver)) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('friendRequest.alreadyFriends')
    );
  }

  sender = await populateUserDocumentWithSentFriendRequests(sender);

  if (
    hasPendingFriendRequest(
      sender as UserDocumentWithSentFriendRequests,
      receiver
    )
  ) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('friendRequest.alreadyPending')
    );
  }

  return true;
};

export const canCancelFriendRequest = async (
  sender: UserDocument,
  friendRequest:
    | FriendRequestDocument
    | FriendRequestDocumentWithReceiverAndSender
) => {
  friendRequest = await populateFriendRequestDocumentWithReceiverAndSender(
    friendRequest
  );

  if (compareMongooseIds(friendRequest.senderId, sender._id)) {
    throw new RequestError(BAD_REQUEST, i18next.t('friendRequest.cantCancel'));
  }

  if (
    areUsersFriends(
      sender,
      (friendRequest as FriendRequestDocumentWithReceiverAndSender).receiver
    )
  ) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('friendRequest.alreadyFriends')
    );
  }

  return true;
};

export const canAcceptFriendRequest = async (
  receiver: UserDocument,
  friendRequest:
    | FriendRequestDocument
    | FriendRequestDocumentWithReceiverAndSender
) => {
  friendRequest = await populateFriendRequestDocumentWithReceiverAndSender(
    friendRequest
  );

  if (!compareMongooseIds(friendRequest.receiverId, receiver._id)) {
    throw new RequestError(BAD_REQUEST, i18next.t('friendRequest.cantAccept'));
  }

  if (
    areUsersFriends(
      receiver,
      (friendRequest as FriendRequestDocumentWithReceiverAndSender).sender
    )
  ) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('friendRequest.alreadyFriends')
    );
  }

  return true;
};

export const canRejectFriendRequest = async (
  receiver: UserDocument,
  friendRequest:
    | FriendRequestDocument
    | FriendRequestDocumentWithReceiverAndSender
) => {
  friendRequest = await populateFriendRequestDocumentWithReceiverAndSender(
    friendRequest
  );

  if (!compareMongooseIds(friendRequest.receiverId, receiver._id)) {
    throw new RequestError(BAD_REQUEST, i18next.t('friendRequest.cantReject'));
  }

  if (
    areUsersFriends(
      receiver,
      (friendRequest as FriendRequestDocumentWithReceiverAndSender).sender
    )
  ) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('friendRequest.alreadyFriends')
    );
  }

  return true;
};

export const deleteFriendRequestHelper = async (
  friendRequest: FriendRequestDocument
) => {
  friendRequest = await friendRequest
    .populate({
      path: 'sender',
      select: {
        sentFriendRequestIds: 1,
      },
    })
    .populate({
      path: 'receiver',
      select: {
        receivedFriendRequestIds: 1,
        notificationIds: 1,
      },
    })
    .execPopulate();

  if (!friendRequest.sender || !friendRequest.receiver) {
    throw new RequestError(SERVER_ERROR, i18next.t('httpError.500'));
    return;
  }

  const sender = friendRequest.sender;
  sender.sentFriendRequestIds.splice(
    sender.sentFriendRequestIds.indexOf(friendRequest._id),
    1
  );
  await sender.save();

  const receiver = friendRequest.receiver;
  receiver.receivedFriendRequestIds.splice(
    receiver.receivedFriendRequestIds.indexOf(friendRequest._id),
    1
  );
  await receiver.save();

  await friendRequest.delete();

  const deleteNotification = async () => {
    let notification;
    try {
      notification =
        await findFriendRequestReceivedNotificationByFriendRequestId(
          friendRequest._id
        );
    } catch (e) {
      console.error(e);
      return;
    }

    receiver.notificationIds.splice(
      receiver.notificationIds.indexOf(notification._id),
      1
    );
    await receiver.save();

    await notification.delete();
  };

  deleteNotification();
};

export const canUnfriend = async (
  user: UserDocument,
  friend: FriendDocument
) => {
  if (!user.friendIds.includes(String(friend._id))) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('friendRequest.cantUnfriend')
    );
  }

  return true;
};
