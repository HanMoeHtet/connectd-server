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
  const userId = String(socket.data.user._id);
  const socketsSetName = getNameForUserSockets(userId);

  socket.join(userId);

  if ((await cache.getSetCount(socketsSetName)) === 0) {
    userOnlineStatusEmitter.emit(UserOnlineStatusEventType.USER_ONLINE);
  }

  await cache.addToSet(socketsSetName, socket.id);
};

const onDisconnect = async (socket: AuthSocket) => {
  const userId = String(socket.data.user._id);
  const socketsSetName = getNameForUserSockets(userId);

  await cache.removeFromSet(socketsSetName, socket.id);

  if ((await cache.getSetCount(socketsSetName)) === 0) {
    userOnlineStatusEmitter.emit(UserOnlineStatusEventType.USER_OFFLINE);
  }
};

io.on('connection', (socket: AuthSocket) => {
  onConnection(socket);

  socket.on('disconnect', (reason) => {
    console.log(`${socket.data.user.username} - ${reason}`);
    onDisconnect(socket);
  });
});

export default io;
