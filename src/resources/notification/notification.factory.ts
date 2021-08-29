import { ClientSession } from 'mongoose';
import NotificationModel from './notification.model';

export const clearNotifications = async (
  session: ClientSession | null = null
) => {
  await NotificationModel.deleteMany({}).session(session);
};
