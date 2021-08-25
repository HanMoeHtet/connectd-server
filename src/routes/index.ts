import { Router } from 'express';
import authRoutes from './auth';
import profileRoutes from './profile';
import newsfeedRoutes from './newsfeed';
import userRoutes from './user';
import postRoutes from './post';
import commentRoutes from './comment';
import replyRoutes from './reply';
import friendRequestRoutes from './friend-request';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/newsfeed', newsfeedRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/replies', replyRoutes);
router.use('/friend-requests', friendRequestRoutes);

export default router;
