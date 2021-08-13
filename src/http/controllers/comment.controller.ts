import {
  MAX_COMMENTS_PER_POST_PER_REQUEST,
  SERVER_ERROR,
  SUCCESS,
} from '@src/constants';
import { PostType } from '@src/resources/post/post.model';
import ReactionModel from '@src/resources/reaction/reaction.model';
import i18next from '@src/services/i18next';
import { Request } from '@src/types/requests';
import { findPost, prepareUpdatedFieldsInPost } from '@src/utils/post';
import { NextFunction, Response } from 'express';

interface GetCommentsInPostRequest
  extends Request<{
    params: {
      postId?: string;
    };
    query: {
      prevCommentId?: string;
      limit?: string;
    };
  }> {}
export const getCommentsInPost = async (
  req: GetCommentsInPostRequest,
  res: Response,
  next: NextFunction
) => {
  const { prevCommentId, limit } = req.query;
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

  const extraQuery = prevCommentId ? { _id: { $lt: prevCommentId } } : {};

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
    },
    post: prepareUpdatedFieldsInPost(post),
  });
};
