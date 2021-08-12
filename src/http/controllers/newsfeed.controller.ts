import { MAX_POSTS_PER_PAGE } from '@src/constants';
import Post, { PostType } from '@src/resources/post/post.model';
import ReactionModel from '@src/resources/reaction/reaction.model';
import { Request, Response } from 'express';
import { AuthResponse } from '@src/types/responses';

export const getPosts = async (req: Request, res: AuthResponse) => {
  const skip = Number(req.query.skip);
  const limit = Math.min(Number(req.query.limit), MAX_POSTS_PER_PAGE);

  if (!limit)
    return res.json({
      data: [],
    });

  const posts = await Post.find({ type: PostType.POST })
    .sort({ createdAt: 'desc' })
    .skip(skip)
    .limit(limit)
    .populate('user', { username: 1, avatar: 1 })
    .select({
      userId: 1,
      type: 1,
      sourceId: 1,
      privacy: 1,
      content: 1,
      reactionCounts: 1,
      reactionIds: 1,
      commentCount: 1,
      shareCount: 1,
      createdAt: 1,
      user: 1,
    })
    .exec();

  const responsePosts = await Promise.all(
    posts.map(async (post) => {
      const reactions = await ReactionModel.find({
        _id: { $in: post.reactionIds },
      }).select({
        type: 1,
      });
      const userReactedRection = reactions.find(
        (reaction) => reaction.userId === res.locals.user._id
      );

      const { reactionIds, ...rest } = post.toJSON();

      return {
        ...rest,
        userReactedReactionType: userReactedRection?.type,
      };
    })
  );

  return res.json({
    data: {
      posts: responsePosts,
    },
  });
};
