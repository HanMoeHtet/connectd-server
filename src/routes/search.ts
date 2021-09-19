import * as SearchController from '@src/http/controllers/search.controller';
import checkAuth from '@src/http/middlewares/check-auth.middleware';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.get('/', SearchController.search);

export default router;
