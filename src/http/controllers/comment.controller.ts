import {
  CREATED,
  MAX_COMMENTS_PER_POST_PER_REQUEST,
  SERVER_ERROR,
  SUCCESS,
} from '@src/constants';
import CommentModel from '@src/resources/comment/comment.model';
import { MediaType, PostType } from '@src/resources/post/post.model';
import ReactionModel from '@src/resources/reaction/reaction.model';
import i18next from '@src/services/i18next';
import { upload } from '@src/services/storage';
import { Request } from '@src/types/requests';
import { AuthResponse } from '@src/types/responses';
import { prepareComment } from '@src/utils/comment';
import { isImage } from '@src/utils/media-type';
import { findPost, prepareUpdatedFieldsInPost } from '@src/utils/post';
import { validateCreateComment } from '@src/utils/validation';
import { NextFunction, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface GetCommentsInPostRequest
  extends Request<{
    params: {
      postId?: string;
    };
    query: {
      lastCommentId?: string;
      limit?: string;
    };
  }> {}
export const getCommentsInPost = async (
  req: GetCommentsInPostRequest,
  res: Response,
  next: NextFunction
) => {
  const { lastCommentId, limit } = req.query;
  const { postId } = req.params;

  let post;

  try {
    post = await findPost(postId);
  } catch (err) {
    next(err);
    return;
  }

  if (!limit)
    return res.status(SUCCESS).json({
      data: {
        comments: [],
      },
    });

  const _limit = Math.min(
    Number(limit) || MAX_COMMENTS_PER_POST_PER_REQUEST,
    MAX_COMMENTS_PER_POST_PER_REQUEST
  );

  const extraQuery = lastCommentId ? { _id: { $lt: lastCommentId } } : {};

  const populateOptions = {
    path: 'comments',
    match: {
      ...extraQuery,
    },
    options: {
      sort: { createdAt: -1 },
      limit: _limit,
    },
    populate: {
      path: 'user',
      select: {
        username: 1,
        avatar: 1,
      },
    },
    select: {
      userId: 1,
      postId: 1,
      content: 1,
      media: 1,
      reactionCounts: 1,
      reactionIds: 1,
      replyCount: 1,
      user: 1,
      createdAt: 1,
    },
  };

  if (post.type === PostType.POST) {
    post = await post.populate(populateOptions).execPopulate();
  } else {
    post = await post.populate(populateOptions).execPopulate();
  }

  if (!post.comments) {
    return res.status(SERVER_ERROR).json({
      message: i18next.t('httpError.500'),
    });
  }

  const responseComments = await Promise.all(
    post.comments.map(async (comment) => {
      const reactions = await ReactionModel.find({
        _id: { $in: comment.reactionIds },
      }).select({
        type: 1,
      });
      const userReactedRection = reactions.find(
        (reaction) => reaction.userId === res.locals.user.id
      );

      const { reactionIds, ...rest } = comment.toJSON();

      return {
        ...rest,
        userReactedReactionType: userReactedRection?.type,
      };
    })
  );

  return res.status(SUCCESS).json({
    data: {
      comments: responseComments,
      post: prepareUpdatedFieldsInPost(post),
    },
  });
};

interface CreateCommentRequest
  extends Request<{
    reqBody: {
      content: string;
    };
    params: {
      postId: string;
    };
  }> {}
export const createComment = async (
  req: CreateCommentRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  try {
    await validateCreateComment(req.body, {
      minContentLength: req.file ? 0 : 1,
    });
  } catch (e) {
    next(e);
    return;
  }

  const { content } = req.body;
  const { postId } = req.params;

  let post;

  try {
    post = await findPost(postId);
  } catch (e) {
    next(e);
    return;
  }

  let media;

  if (req.file) {
    media = {
      url: await upload(`media/${uuidv4()}`, req.file.buffer),
      type: isImage(req.file.mimetype) ? MediaType.IMAGE : MediaType.VIDEO,
    };
  }

  const user = res.locals.user;

  let comment = new CommentModel({
    userId: user._id,
    postId: post._id,
    content,
    media,
  });

  comment = await comment
    .populate({
      path: 'user',
      select: {
        username: 1,
        avatar: 1,
      },
    })
    .execPopulate();

  await comment.save();

  post.commentCount++;
  post.commentIds.push(comment._id);
  await post.save();

  user.commentIds.push(comment._id);
  await user.save();

  res.status(CREATED).json({
    data: {
      comment: prepareComment(comment),
      post: prepareUpdatedFieldsInPost(post),
    },
  });
};
