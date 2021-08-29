import { model, Schema } from '@src/config/database.config';
import { Document } from 'mongoose';
import { FriendRequestDocument } from '../friend-request/friend-request.model';

export enum NotificationType {
  FRIEND_REQUEST_RECEIVED = 'FRIEND_REQUEST_RECEIVED',
  FRIEND_REQUEST_ACCEPTED = 'FRIEND_REQUEST_ACCEPTED',
}

export interface BaseNotification {
  hasBeenRead: boolean;
  hasBeenSeen: boolean;
  type: NotificationType;
  createdAt: Date;
}

export interface FriendRequestReceivedNotification extends BaseNotification {
  type: NotificationType.FRIEND_REQUEST_RECEIVED;
  friendRequestId: string;
  friendRequest?: FriendRequestDocument;
}

export interface FriendRequestAcceptedNotification extends BaseNotification {
  type: NotificationType.FRIEND_REQUEST_ACCEPTED;
}

export type Notification =
  | FriendRequestReceivedNotification
  | FriendRequestAcceptedNotification;

const NotificationSchema = new Schema<Notification>({
  hasBeenRead: {
    type: Boolean,
    default: false,
  },
  hasBeenSeen: {
    type: Boolean,
    default: false,
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

NotificationSchema.virtual('friendRequest', {
  ref: 'FriendRequest',
  localField: 'friendRequestId',
  foreignField: '_id',
  justOne: true,
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
