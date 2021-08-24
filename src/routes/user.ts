import * as UserController from '@src/http/controllers/user.controller';
import * as FriendController from '@src/http/controllers/friend.controller';
import checkAuth from '@src/http/middlewares/check-auth.middleware';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.get('/:userId', UserController.show);
router.get('/:userId/basic', UserController.getBasicProfile);
router.get('/:userId/profile', UserController.getProfile);
router.get('/:userId/posts', UserController.getPostsByUser);

router.get('/:userId/friends', FriendController.getFriendsByUser);
router.post('/:userId/friends', FriendController.createFriendRequest);

export default router;
