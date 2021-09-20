import * as ConversationController from '@src/http/controllers/conversation.controller';
import checkAuth from '@src/http/middlewares/check-auth.middleware';
import { Router } from 'express';

const router = Router();

router.use(checkAuth);

router.get('/:conversationId', ConversationController.getConversation);
router.get(
  '/:conversationId/messages',
  ConversationController.getMessagesInConversation
);
router.post(
  '/:conversationId/messages',
  ConversationController.createMessageInConversation
);

export default router;
