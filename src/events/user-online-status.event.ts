import FriendModel from '@src/resources/friend/friend.model';
import UserModel, { UserDocument } from '@src/resources/user/user.model';
import { getFriendUserIdsByUser } from '@src/utils/friend';
import { compareMongooseIds } from '@src/utils/helpers';
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

    const friendUserIds = await getFriendUserIdsByUser(user);

    emitUserOnline(friendUserIds, { userId: String(user._id) });
  }
);

userOnlineStatusEmitter.on(
  UserOnlineStatusEventType.USER_OFFLINE,
  async (user: UserDocument) => {
    user.lastSeenAt = new Date();
    await user.save();

    const friendUserIds = await getFriendUserIdsByUser(user);

    emitUserOffline(friendUserIds, { userId: String(user._id) });
  }
);
