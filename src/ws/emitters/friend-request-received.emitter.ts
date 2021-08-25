import { NotificationType } from '@src/resources/notification/notification.model';
import io from '@src/ws';

export const NAME = 'friend-request-received';

export interface EmitOptions {
  _id: string;
  isRead: boolean;
  type: NotificationType.FRIEND_REQUEST_RECEIVED;
  friendRequest: {
    _id: string;
    sender: {
      _id: string;
      username: string;
      avatar?: string;
    };
    receiverId: string;
    createdAt: Date;
  };
  createdAt: Date;
}
export const emit = ({ _id, friendRequest, createdAt, type }: EmitOptions) => {
  io.to(String(friendRequest.receiverId)).emit(NAME, {
    _id,
    type,
    friendRequest,
    createdAt,
  });
};
