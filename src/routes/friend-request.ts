import * as FriendController from '@src/http/controllers/friend.controller';
import checkAuth from '@src/http/middlewares/check-auth.middleware';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.post('/:friendRequestId/accept', FriendController.acceptFriendRequest);
router.post('/:friendRequestId/reject', FriendController.rejectFriendRequest);
router.post('/:friendRequestId/cancel', FriendController.cancelFriendRequest);

export default router;
