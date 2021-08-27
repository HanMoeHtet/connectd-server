import {
  getNewNotificationsCount,
  getNotifications,
} from '@src/http/controllers/notification.controller';
import {
  getBasicProfile,
  getProfile,
} from '@src/http/controllers/profile.controller';
import checkAuth from '@src/http/middlewares/check-auth.middleware';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.get('/', getProfile);
router.get('/basic', getBasicProfile);

router.get('/new-notifications-count', getNewNotificationsCount);
router.get('/notifications', getNotifications);

export default router;
