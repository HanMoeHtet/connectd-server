import * as UserController from '@src/http/controllers/user.contorller';
import checkAuth from '@src/http/middlewares/check-auth.middleware';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.get('/:userId/basic', UserController.getBasicProfile);
router.get('/:userId', UserController.getProfile);
router.get('/:userId/posts', UserController.getPostsByUser);

export default router;
