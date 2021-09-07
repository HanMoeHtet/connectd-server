import * as FriendController from '@src/http/controllers/friend.controller';
import checkAuth from '@src/http/middlewares/check-auth.middleware';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.delete('/:friendId', FriendController.unfriend);
router.post('/online', FriendController.getOnlineFriends);

export default router;
