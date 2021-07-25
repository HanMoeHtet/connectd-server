import { show } from '@src/controllers/ProfileController';
import checkAuth from '@src/middlewares/CheckAuth';
import { Router } from 'express';

const router = Router();

router.get('/', checkAuth, show);

export default router;
