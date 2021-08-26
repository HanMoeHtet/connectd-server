import { model, Schema } from '@src/config/database.config';
import { Document } from 'mongoose';

export enum NotificationType {
  FRIEND_REQUEST_RECEIVED = 'FRIEND_REQUEST_RECEIVED',
  FRIEND_REQUEST_ACCEPTED = 'FRIEND_REQUEST_ACCEPTED',
}

export interface BaseNotification {
  isRead: boolean;
  hasBeenSeen: boolean;
  type: NotificationType;
  createdAt: Date;
}

export interface FriendRequestReceivedNotification extends BaseNotification {
  type: NotificationType.FRIEND_REQUEST_RECEIVED;
  friendRequestId: string;
}

export interface FriendRequestAcceptedNotification extends BaseNotification {
  type: NotificationType.FRIEND_REQUEST_ACCEPTED;
}

export type Notification =
  | FriendRequestReceivedNotification
  | FriendRequestAcceptedNotification;

const NotificationSchema = new Schema<Notification>({
  isRead: {
    type: Boolean,
    default: false,
  },
  hasBeenSeen: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: true,
  },
  friendRequestId: {
    type: String,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

NotificationSchema.set('toObject', { virtuals: true });
NotificationSchema.set('toJSON', {
  virtuals: true,
});

export const NotificationModel = model<Notification>(
  'Notification',
  NotificationSchema
);

export type NotificationDocument = Notification & Document;

export default NotificationModel;
