import * as NewsfeedController from '@src/http/controllers/newsfeed.controller';
import { Router } from 'express';
import checkAuth from '@src/http/middlewares/check-auth.middleware';

const router = Router();

router.use(checkAuth);

router.get('/posts', NewsfeedController.getPosts);

export default router;
