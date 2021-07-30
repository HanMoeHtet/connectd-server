import { MAX_POSTS_PER_PAGE } from '@src/constants';
import Post from '@src/models/Post';
import { Request, Response } from 'express';

export const getPosts = async (req: Request, res: Response) => {
  const skip = Number(req.query.skip);
  const limit = Math.max(Number(req.query.limit), MAX_POSTS_PER_PAGE);

  const posts = await Post.find({})
    .sort({ createdAt: 'desc' })
    .skip(skip)
    .limit(limit)
    .exec();

  return res.json({
    data: posts,
  });
};
