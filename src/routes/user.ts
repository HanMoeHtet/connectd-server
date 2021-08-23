import * as UserController from '@src/http/controllers/user.controller';
import checkAuth from '@src/http/middlewares/check-auth.middleware';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.get('/:userId', UserController.show);
router.get('/:userId/basic', UserController.getBasicProfile);
router.get('/:userId/profile', UserController.getProfile);
router.get('/:userId/posts', UserController.getPostsByUser);
router.get('/:userId/friends', UserController.getFriendsByUser);

export default router;
