import { BAD_REQUEST, SERVER_ERROR } from '@src/constants';
import { RequestError } from '@src/http/error-handlers/handler';
import FriendRequestModel, {
  FriendRequestDocument,
} from '@src/resources/friend/friend-request.model';
import { FriendDocument } from '@src/resources/friend/friend.model';
import { UserDocument } from '@src/resources/user/user.model';
import i18next from '@src/services/i18next';
import { compareMongooseIds } from './helpers';

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

export const areUsersFriends = (
  userOne: UserDocumentWithFriends,
  userTwo: UserDocumentWithFriends
) => {
  const userOneFriends = userOne.friends;
  const userTwoFriends = userTwo.friends;

  if (userOneFriends.length < userTwoFriends.length) {
    return userOneFriends.some((friend) =>
      compareMongooseIds(friend.userId, userTwo._id)
    );
  } else {
    return userTwoFriends.some((friend) =>
      compareMongooseIds(friend.userId, userOne._id)
    );
  }
};

export const hasPendingFriendRequest = (
  sender: UserDocumentWithFriends,
  receiver: UserDocumentWithFriends
) => {
  return sender.sentFriendRequestIds.some((friendRequestId) =>
    receiver.receivedFriendRequestIds.includes(friendRequestId)
  );
};

export const canCreateFriendRequest = async (
  sender: UserDocument,
  receiver: UserDocument
) => {
  let _sender = (sender = await populateUserDocumentWithFriends(sender));
  let _receiver = (receiver = await populateUserDocumentWithFriends(receiver));

  if (compareMongooseIds(_receiver._id, _sender._id)) {
    throw new RequestError(BAD_REQUEST, i18next.t('friendRequest.cantSend'));
  }

  if (areUsersFriends(_sender, _receiver)) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('friendRequest.alreadyFriends')
    );
  }

  if (hasPendingFriendRequest(_sender, _receiver)) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('friendRequest.alreadyPending')
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
  let _receiver = (receiver = await populateUserDocumentWithFriends(receiver));
  let _friendRequest = (friendRequest =
    await populateFriendRequestDocumentWithReceiverAndSender(friendRequest));

  if (!compareMongooseIds(friendRequest.receiverId, _receiver._id)) {
    throw new RequestError(BAD_REQUEST, i18next.t('friendRequest.cantAccept'));
  }

  if (areUsersFriends(_receiver, _friendRequest.sender)) {
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
  let _receiver = (receiver = await populateUserDocumentWithFriends(receiver));
  let _friendRequest = (friendRequest =
    await populateFriendRequestDocumentWithReceiverAndSender(friendRequest));

  if (!compareMongooseIds(friendRequest.receiverId, receiver._id)) {
    throw new RequestError(BAD_REQUEST, i18next.t('friendRequest.cantReject'));
  }

  if (areUsersFriends(_receiver, _friendRequest.sender)) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('friendRequest.alreadyFriends')
    );
  }

  return true;
};
