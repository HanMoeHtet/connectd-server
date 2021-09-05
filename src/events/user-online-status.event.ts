import { UserDocument } from '@src/resources/user/user.model';
import { getOnlineFriendUserIdsByUser } from '@src/utils/friend';
import {
  emitUserOffline,
  emitUserOnline,
} from '@src/ws/emitters/user-online-status.emitter';
import { EventEmitter } from 'events';

export const userOnlineStatusEmitter = new EventEmitter();

export enum UserOnlineStatusEventType {
  USER_ONLINE = 'USER_ONLINE',
  USER_OFFLINE = 'USER_OFFLINE',
}

userOnlineStatusEmitter.on(
  UserOnlineStatusEventType.USER_ONLINE,
  async (user: UserDocument) => {
    user.lastSeenAt = null;
    await user.save();

    const onlineFriendUserIds = await getOnlineFriendUserIdsByUser(user);

    emitUserOnline(onlineFriendUserIds, { userId: String(user._id) });
  }
);

userOnlineStatusEmitter.on(
  UserOnlineStatusEventType.USER_OFFLINE,
  async (user: UserDocument) => {
    user.lastSeenAt = new Date();
    await user.save();

    const onlineFriendUserIds = await getOnlineFriendUserIdsByUser(user);

    emitUserOffline(onlineFriendUserIds, { userId: String(user._id) });
  }
);
