import * as NewsfeedController from '@src/controllers/NewsfeedController';
import { Router } from 'express';
import checkAuth from '@src/middlewares/CheckAuth';

const router = Router();

router.use(checkAuth);

router.get('/posts', NewsfeedController.getPosts);

export default router;
