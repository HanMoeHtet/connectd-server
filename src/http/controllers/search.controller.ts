import { BAD_REQUEST, SUCCESS } from '@src/constants';
import PostModel from '@src/resources/post/post.model';
import ReactionModel from '@src/resources/reaction/reaction.model';
import UserModel from '@src/resources/user/user.model';
import { Request } from '@src/types/requests';
import { AuthResponse } from '@src/types/responses';
import { getFriendId } from '@src/utils/friend';
import { compareMongooseIds } from '@src/utils/helpers';

interface SearchRequest
  extends Request<{
    query: {
      q?: string;
    };
  }> {}
export const search = async (req: SearchRequest, res: AuthResponse) => {
  const { q } = req.query;
  const authUser = res.locals.user;

  if (!q || q.length === 0) {
    res.status(BAD_REQUEST).end();
    return;
  }

  const regex = new RegExp(`${q}`, 'ig');

  const users = await UserModel.find({
    username: regex,
  }).select({
    _id: 1,
    username: 1,
    avatar: 1,
    friendIds: 1,
  });

  const posts = await PostModel.find({
    content: regex,
  })
    .populate('user', { username: 1, avatar: 1 })
    .populate({
      path: 'source',
      populate: {
        path: 'user',
        select: {
          username: 1,
          avatar: 1,
        },
      },
      select: {
        userId: 1,
        type: 1,
        privacy: 1,
        content: 1,
        createdAt: 1,
        user: 1,
      },
    })
    .select({
      userId: 1,
      type: 1,
      sourceId: 1,
      privacy: 1,
      content: 1,
      media: 1,
      reactionCounts: 1,
      reactionIds: 1,
      commentCount: 1,
      shareCount: 1,
      createdAt: 1,
      user: 1,
    })
    .exec();

  const responseUsers = await Promise.all(
    users.map(async (user) => {
      const isAuthUser = compareMongooseIds(authUser._id, user._id);
      let friendId;
      if (!isAuthUser) {
        friendId = getFriendId(authUser, user);
      }

      const { friendIds, ...rest } = user.toJSON();

      return {
        ...rest,
        isAuthUser,
        friendId,
      };
    })
  );

  const responsePosts = await Promise.all(
    posts.map(async (post) => {
      const reactions = await ReactionModel.find({
        _id: { $in: post.reactionIds },
      }).select({
        type: 1,
        userId: 1,
      });

      const userReactedReaction = reactions.find((reaction) =>
        compareMongooseIds(reaction.userId, res.locals.user._id)
      );

      const { reactionIds, ...rest } = post.toJSON();

      return {
        ...rest,
        userReactedReactionType: userReactedReaction?.type,
      };
    })
  );

  res.status(SUCCESS).json({
    data: {
      users: responseUsers,
      posts: responsePosts,
    },
  });
};
