import { BAD_REQUEST } from '@src/constants';
import { RequestError } from '@src/http/error-handlers/handler';
import NotificationModel, {
  NotificationType,
} from '@src/resources/notification/notification.model';
import i18next from '@src/services/i18next';

export const findFriendRequestReceivedNotificationByFriendRequestId = async (
  friendRequestId?: string
) => {
  if (!friendRequestId) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('missing', { field: 'friendRequestId' })
    );
  }

  let notification;
  try {
    notification = await NotificationModel.findOne({
      friendRequestId,
      type: NotificationType.FRIEND_REQUEST_RECEIVED,
    });
  } catch (e) {
    throw new RequestError(BAD_REQUEST, i18next.t('httpError.404'), e);
  }

  if (!notification) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('notFound', { field: 'friend request' })
    );
  }

  return notification;
};
