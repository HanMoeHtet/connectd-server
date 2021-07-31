import * as UserController from '@src/controllers/UserController';
import checkAuth from '@src/middlewares/CheckAuth';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.get('/:userId/posts', UserController.getPostsByUser);

export default router;
