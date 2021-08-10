import * as PostController from '@src/http/controllers/post.controller';
import checkAuth from '@src/http/middlewares/check-auth.middleware.';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.get('/:postId', PostController.show);
router.get('/:postId/reactions', PostController.getReactionsInPost);
router.post('/:postId/reactions', PostController.addReactionToPost);
router.delete('/:postId/reactions', PostController.removeReactionFromPost);
router.get('/:postId/comments', PostController.getCommentsInPost);
router.get('/:postId/shares', PostController.getSharesInPost);

export default router;
