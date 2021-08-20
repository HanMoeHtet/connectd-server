import * as PostController from '@src/http/controllers/post.controller';
import * as CommentController from '@src/http/controllers/comment.controller';
import * as ReactionInPostController from '@src/http/controllers/reaction-in-post.controller';
import * as ShareController from '@src/http/controllers/share.controller';
import checkAuth from '@src/http/middlewares/check-auth.middleware';
import { Router } from 'express';
import fileUpload from '@src/services/file-upload';

const router = Router();

router.use(checkAuth);

router.get('/:postId', PostController.show);
router.post('/', fileUpload.single('media'), PostController.create);

router.get('/:postId/reactions', ReactionInPostController.getReactionsInPost);
router.post('/:postId/reactions', ReactionInPostController.addReactionToPost);
router.delete(
  '/:postId/reactions',
  ReactionInPostController.removeReactionFromPost
);

router.get('/:postId/comments', CommentController.getCommentsInPost);
router.post(
  '/:postId/comments',
  fileUpload.single('media'),
  CommentController.createComment
);

router.post(
  '/:postId/shares',
  fileUpload.single('media'),
  ShareController.create
);

export default router;
