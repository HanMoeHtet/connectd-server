import { MAX_POSTS_PER_PAGE, SUCCESS } from '@src/constants';
import { Request } from '@src/types/requests';
import { AuthResponse } from '@src/types/responses';

export const getNewNotificationsCount = async (
  req: Request,
  res: AuthResponse
) => {
  let authUser = res.locals.user;

  authUser = await authUser
    .populate({
      path: 'notifications',
      match: {
        hasBeenSeen: false,
      },
      select: {
        hasBeenSeen: 1,
      },
    })
    .execPopulate();

  res.status(SUCCESS).json({
    data: {
      newNotificationsCount: authUser.notifications?.length || 0,
    },
  });
};

interface GetNotificationsRequest
  extends Request<{
    query: {
      limit?: string;
      lastNotificationId?: string;
    };
  }> {}
export const getNotifications = async (
  req: GetNotificationsRequest,
  res: AuthResponse
) => {
  const { limit, lastNotificationId } = req.query;
  let authUser = res.locals.user;

  const _limit = Math.min(
    Number(limit) || MAX_POSTS_PER_PAGE,
    MAX_POSTS_PER_PAGE
  );

  const extraQuery = lastNotificationId
    ? { _id: { $lt: lastNotificationId } }
    : {};

  const populateOptions = {
    path: 'notifications',
    match: {
      ...extraQuery,
    },
    options: {
      sort: { createdAt: -1 },
      limit: _limit,
    },
    populate: [
      {
        path: 'friendRequest',
        populate: [
          {
            path: 'sender',
            select: {
              username: 1,
              avatar: 1,
            },
          },
          {
            path: 'receiver',
            select: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    ],
  };

  authUser = await authUser.populate(populateOptions).execPopulate();

  const notifications = authUser.notifications || [];

  const lastNotification = notifications[notifications.length - 1];
  const hasMore = authUser.notificationIds.some(
    (postId) => lastNotification && postId < lastNotification._id
  );

  res.status(SUCCESS).json({
    data: {
      notifications,
      hasMore,
    },
  });
};
