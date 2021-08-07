import { MAX_POSTS_PER_PAGE } from '@src/constants';
import Post, { PostType } from '@src/resources/post/post.model';
import { Request, Response } from 'express';

export const getPosts = async (req: Request, res: Response) => {
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
    .populate('user', { id: 1, username: 1, avatar: 1 })
    .select({
      id: 1,
      userId: 1,
      type: 1,
      sourceId: 1,
      privacy: 1,
      content: 1,
      reactionCounts: 1,
      commentCount: 1,
      shareCount: 1,
      createdAt: 1,
      user: 1,
    })
    .exec();

  return res.json({
    data: {
      posts,
    },
  });
};
