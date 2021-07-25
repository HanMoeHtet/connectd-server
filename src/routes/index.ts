import { Router } from 'express';
import authRoutes from './auth';
import profileRoutes from './profile';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);

export default router;
