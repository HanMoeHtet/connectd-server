import { Router } from 'express';
import authRoutes from './auth';
import profileRoutes from './profile';
import newsfeedRoutes from './newsfeed';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/newsfeed', newsfeedRoutes);

export default router;
