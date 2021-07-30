import * as PostController from '@src/controllers/UserController';
import checkAuth from '@src/middlewares/CheckAuth';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.get('/:userId/posts', PostController.getPostsByUser);

export default router;
