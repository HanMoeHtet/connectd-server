import { AuthResponse } from '@src/types/responses';
import { Request } from '@src/types/requests';
import { SUCCESS } from '@src/constants';
import { getOnlineFriendUserIdsByUser } from '@src/utils/friend';

export const getOnlineStatus = async (req: Request, res: AuthResponse) => {
  const authUser = res.locals.user;

  const userIds = await getOnlineFriendUserIdsByUser(authUser);

  res.status(SUCCESS).json({
    data: {
      userIds,
    },
  });
};
