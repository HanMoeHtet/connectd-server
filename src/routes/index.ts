import { Router } from 'express';
import authRoutes from './auth';
import profileRoutes from './profile';
import newsfeedRoutes from './newsfeed';
import userRoutes from './uses';
import postRoutes from './posts';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/newsfeed', newsfeedRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);

export default router;
