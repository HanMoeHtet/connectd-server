import * as OnlineStatusContorller from '@src/http/controllers/online-status.controller';
import checkAuth from '@src/http/middlewares/check-auth.middleware';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.get('/', OnlineStatusContorller.getOnlineStatus);

export default router;
