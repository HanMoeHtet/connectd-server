import {
  getBasicProfile,
  getProfile,
} from '@src/controllers/ProfileController';
import checkAuth from '@src/middlewares/CheckAuth';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.get('/', getProfile);
router.get('/basic', getBasicProfile);

export default router;
