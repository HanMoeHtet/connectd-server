import * as PostController from '@src/controllers/PostController';
import checkAuth from '@src/middlewares/CheckAuth';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.get('/:postId', PostController.show);
router.get('/:postId/comments', PostController.getCommentsInPost);

export default router;
