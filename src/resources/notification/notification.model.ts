import { model, Schema } from '@src/config/database.config';
import { Document } from 'mongoose';

export enum NotificationType {
  FRIEND_REQUEST_RECEIVED = 'FRIEND_REQUEST_RECEIVED',
}

export interface BaseNotification {
  isRead: boolean;
  createdAt: Date;
}

export interface FriendRequestReceivedNotification extends BaseNotification {
  type: NotificationType.FRIEND_REQUEST_RECEIVED;
  friendRequestId: string;
}

export type Notification = FriendRequestReceivedNotification;

const NotificationSchema = new Schema<Notification>({
  isRead: {
    type: Boolean,
    default: false,
  },
  friendRequestId: {
    type: String,
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

export interface NotificationDocument extends Notification, Document {}

export default NotificationModel;
