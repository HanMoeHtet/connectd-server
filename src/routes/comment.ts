import * as CommentController from '@src/http/controllers/comment.controller';
import * as ReactionInCommentController from '@src/http/controllers/reaction-in-comment.controller';
import * as ReplyController from '@src/http/controllers/reply.controller';
import checkAuth from '@src/http/middlewares/check-auth.middleware.';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.get(
  '/:commentId/reactions',
  ReactionInCommentController.getReactionsInComment
);
router.post(
  '/:commentId/reactions',
  ReactionInCommentController.addReactionToComment
);
router.delete(
  '/:commentId/reactions',
  ReactionInCommentController.removeReactionFromComment
);

router.get('/:commentId/replies', ReplyController.getRepliesInComment);
router.post('/:commentId/replies', ReplyController.createReply);

export default router;
