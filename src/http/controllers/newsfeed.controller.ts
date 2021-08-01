import { MAX_POSTS_PER_PAGE } from '@src/constants';
import Post from '@src/resources/post/post.model';
import { Request, Response } from 'express';

export const getPosts = async (req: Request, res: Response) => {
  const skip = Number(req.query.skip);
  const limit = Math.min(Number(req.query.limit), MAX_POSTS_PER_PAGE);

  if (!limit)
    return res.json({
      data: [],
    });

  const posts = await Post.find({})
    .sort({ createdAt: 'desc' })
    .skip(skip)
    .limit(limit)
    .exec();

  return res.json({
    data: posts,
  });
};
