import io from '@src/ws';

export const getSocketIdsByUserId = (userId: string) => {
  return io.sockets.adapter.rooms.get(String(userId));
};

export const addUserToRoom = (userId: string, roomId: string) => {
  const socketIds = getSocketIdsByUserId(userId);
  if (socketIds) {
    socketIds.forEach((socketId) => {
      io.sockets.adapter.addAll(socketId, new Set([roomId]));
    });
  }
};
