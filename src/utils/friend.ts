import { BAD_REQUEST } from '@src/constants';
import { RequestError } from '@src/http/error-handlers/handler';
import FriendRequestModel, {
  FriendRequestDocument,
} from '@src/resources/friend/friend-request.model';
import { UserDocument } from '@src/resources/user/user.model';
import i18next from '@src/services/i18next';
import { compareMongooseIds } from './helpers';

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

export const canCreateFriendRequest = (
  sender: UserDocument,
  receiver: UserDocument
) => {
  if (compareMongooseIds(receiver._id, sender._id)) {
    throw new RequestError(BAD_REQUEST, i18next.t('friendRequest.cantSend'));
  }
};

export const canAcceptFriendRequest = (
  receiver: UserDocument,
  friendRequest: FriendRequestDocument
) => {
  if (!compareMongooseIds(friendRequest.receiverId, receiver._id)) {
    throw new RequestError(BAD_REQUEST, i18next.t('friendRequest.cantAccept'));
  }
};
