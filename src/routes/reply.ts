import * as ReactionInReplyController from '@src/http/controllers/reaction-in-reply.controller';
import checkAuth from '@src/http/middlewares/check-auth.middleware';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.get(
  '/:replyId/reactions',
  ReactionInReplyController.getReactionsInReply
);
router.post(
  '/:replyId/reactions',
  ReactionInReplyController.addReactionToReply
);
router.delete(
  '/:replyId/reactions',
  ReactionInReplyController.removeReactionFromReply
);

export default router;
