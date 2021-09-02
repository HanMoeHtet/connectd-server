import { NotificationType } from '@src/resources/notification/notification.model';
import io from '@src/ws';

export const NAME = 'friend-request-accepted';

export interface EmitPayload {
  _id: string;
  hasBeenRead: boolean;
  hasBeenSeen: boolean;
  type: NotificationType.FRIEND_REQUEST_ACCEPTED;
  friendUser: {
    _id: string;
    username: string;
    avatar?: string;
  };
  createdAt: Date;
}
export const emit = (to: string, payload: EmitPayload) => {
  io.to(to).emit(NAME, payload);
};
