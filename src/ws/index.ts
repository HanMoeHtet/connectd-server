import io from '@src/config/ws.config';
import * as cache from '@src/services/cache';
import { AuthSocket } from '@src/types/ws';
import { getNameForUserSockets } from '@src/utils/cache';
import checkAuth from '@src/ws/middlewares/check-auth.middleware';
import {
  userOnlineStatusEmitter,
  UserOnlineStatusEventType,
} from '@src/events/user-online-status.event';

io.use(checkAuth);

const onConnection = async (socket: AuthSocket) => {
  const authUser = socket.data.user;
  const userId = String(authUser._id);
  const socketsSetName = getNameForUserSockets(userId);

  socket.join(userId);
  socket.join(authUser.conversationIds.map(String));

  if ((await cache.getSetCount(socketsSetName)) === 0) {
    userOnlineStatusEmitter.emit(
      UserOnlineStatusEventType.USER_ONLINE,
      authUser
    );
  }

  await cache.addToSet(socketsSetName, socket.id);
};

const onDisconnect = async (socket: AuthSocket) => {
  const authUser = socket.data.user;
  const userId = String(authUser._id);
  const socketsSetName = getNameForUserSockets(userId);

  await cache.removeFromSet(socketsSetName, socket.id);

  if ((await cache.getSetCount(socketsSetName)) === 0) {
    userOnlineStatusEmitter.emit(
      UserOnlineStatusEventType.USER_OFFLINE,
      authUser
    );
  }
};

io.on('connection', async (socket: AuthSocket) => {
  await onConnection(socket);

  socket.on('disconnect', async (reason) => {
    await onDisconnect(socket);
  });
});

export default io;
