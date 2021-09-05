import io from '@src/ws';

export enum StatusType {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export interface UserOnlineStatusEmitPayload {
  userId: string;
}

export const emitUserOnline = (
  to: string[],
  payload: UserOnlineStatusEmitPayload
) => {
  io.to(to).emit(`user-online-status`, {
    status: StatusType.ONLINE,
    ...payload,
  });
};

export const emitUserOffline = (
  to: string[],
  payload: UserOnlineStatusEmitPayload
) => {
  io.to(to).emit(`user-online-status`, {
    status: StatusType.OFFLINE,
    ...payload,
  });
};
