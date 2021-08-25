import { NotificationType } from '@src/resources/notification/notification.model';
import io from '@src/ws';

export const NAME = 'friend-request-accepted';

export interface EmitOptions {
  _id: string;
  isRead: boolean;
  type: NotificationType.FRIEND_REQUEST_ACCEPTED;
  friendRequest: {
    _id: string;
    receiver: {
      _id: string;
      username: string;
      avatar?: string;
    };
    sender: {
      _id: string;
      username: string;
      avatar?: string;
    };
    createdAt: Date;
  };
  createdAt: Date;
}
export const emit = ({ _id, friendRequest, createdAt, type }: EmitOptions) => {
  io.to(String(friendRequest.sender._id)).emit(NAME, {
    _id,
    type,
    friendRequest,
    createdAt,
  });
};
