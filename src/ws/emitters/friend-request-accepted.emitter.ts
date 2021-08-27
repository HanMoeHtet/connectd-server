import { NotificationType } from '@src/resources/notification/notification.model';
import io from '@src/ws';

export const NAME = 'friend-request-accepted';

export interface EmitData {
  _id: string;
  hasBeenRead: boolean;
  hasBeenSeen: boolean;
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
export const emit = (data: EmitData) => {
  io.to(String(data.friendRequest.sender._id)).emit(NAME, data);
};
