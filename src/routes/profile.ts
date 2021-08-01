import {
  getBasicProfile,
  getProfile,
} from '@src/http/controllers/profile.controller';
import checkAuth from '@src/http/middlewares/check-auth.middleware.';
import { Request, Router } from 'express';

const router = Router();

router.use(checkAuth);

router.get('/', getProfile);
router.get('/basic', getBasicProfile);

export default router;
