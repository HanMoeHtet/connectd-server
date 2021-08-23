import {
  BAD_REQUEST,
  MAX_POSTS_PER_PAGE,
  NOT_FOUND,
  SUCCESS,
} from '@src/constants';
import { RequestError } from '@src/http/error-handlers/handler';
import Post from '@src/resources/post/post.model';
import ReactionModel from '@src/resources/reaction/reaction.model';
import User, { UserModel } from '@src/resources/user/user.model';
import i18next from '@src/services/i18next';
import { Request } from '@src/types/requests';
import { AuthResponse } from '@src/types/responses';
import { compareMongooseIds } from '@src/utils/helpers';
import {
  prepareBasicProfileResponse,
  prepareProfileResponse,
} from '@src/utils/profile';
import { NextFunction, Response } from 'express';

export const findUser = async (userId?: string, selectOptions?: {}) => {
  if (!userId) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('missing', { field: 'userId' })
    );
  }

  let user;
  try {
    user = await UserModel.findById(userId).select(selectOptions);
  } catch (e) {
    throw new RequestError(BAD_REQUEST, i18next.t('httpError.500'), e);
  }

  if (!user) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('notFound', { field: 'user' })
    );
  }

  return user;
};

export interface GetProfileRequest
  extends Request<{
    params: {
      userId?: string;
    };
  }> {}
export const getProfile = async (
  req: GetProfileRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  let user;
  try {
    user = await findUser(userId);
  } catch (e) {
    next(e);
    return;
  }

  return res.status(SUCCESS).json({
    data: {
      user: prepareProfileResponse(user),
    },
  });
};

export interface GetProfileRequest
  extends Request<{
    params: {
      userId?: string;
    };
  }> {}
export const getBasicProfile = async (
  req: GetProfileRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  let user;
  try {
    user = await findUser(userId);
  } catch (e) {
    next(e);
    return;
  }

  return res.status(SUCCESS).json({
    data: {
      user: prepareBasicProfileResponse(user),
    },
  });
};

interface GetPostsByUserRequest
  extends Request<{
    params: {
      userId?: string;
    };
    query: {
      limit?: string;
      lastPostId?: string;
    };
  }> {}
export const getPostsByUser = async (
  req: GetPostsByUserRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  let user;

  try {
    user = await findUser(userId);
  } catch (e) {
    next(e);
    return;
  }

  const { limit, lastPostId } = req.query;

  const _limit = Math.min(
    Number(limit) || MAX_POSTS_PER_PAGE,
    MAX_POSTS_PER_PAGE
  );

  const extraQuery = lastPostId ? { _id: { $lt: lastPostId } } : {};

  const populateOptions = {
    path: 'posts',
    match: {
      ...extraQuery,
    },
    options: {
      sort: { createdAt: -1 },
      limit: _limit,
    },
    populate: [
      {
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
      },
      {
        path: 'user',
        select: { username: 1, avatar: 1 },
      },
    ],
    select: {
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
    },
  };

  user = await user.populate(populateOptions).execPopulate();

  const posts = user.posts || [];

  const lastPost = posts[posts.length - 1];
  const hasMore = user.postIds.some(
    (postId) => lastPost && postId < lastPost._id
  );

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

  return res.status(SUCCESS).json({
    data: {
      posts: responsePosts,
      hasMore,
    },
  });
};

interface ShowRequest
  extends Request<{
    params: {
      userId?: string;
    };
  }> {}
export const show = async (
  req: ShowRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { userId } = req.params;

  let user;
  try {
    user = await findUser(userId, {
      username: 1,
      email: 1,
      phoneNumber: 1,
      birthday: 1,
      pronouns: 1,
      avatar: 1,
      postIds: 1,
      friendIds: 1,
    });
  } catch (e) {
    next(e);
    return;
  }

  const friendCount = user.friendIds.length;
  const postCount = user.postIds.length;

  const authUser = res.locals.user;

  const isAuthUser = compareMongooseIds(userId, authUser._id);
  const areUsersFriends = isAuthUser
    ? undefined
    : user.friendIds.includes(authUser._id);

  const { postIds, friendIds, ...rest } = user.toJSON();

  res.status(SUCCESS).json({
    data: {
      user: {
        ...rest,
        friendCount,
        postCount,
      },
      isAuthUser,
      areUsersFriends,
    },
  });
};

interface GetFriendsByUserRequest
  extends Request<{
    params: {
      userId?: string;
    };
    query: {
      limit?: string;
      lastFriendId?: string;
    };
  }> {}
export const getFriendsByUser = async (
  req: GetFriendsByUserRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { userId } = req.params;

  let user;

  try {
    user = await findUser(userId);
  } catch (e) {
    next(e);
    return;
  }

  const { limit, lastFriendId } = req.query;

  const _limit = Math.min(
    Number(limit) || MAX_POSTS_PER_PAGE,
    MAX_POSTS_PER_PAGE
  );

  const extraQuery = lastFriendId ? { _id: { $lt: lastFriendId } } : {};

  const populateOptions = {
    path: 'friends',
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
        friendIds: 1,
      },
    },
  };

  user = await user.populate(populateOptions).execPopulate();

  const authUser = res.locals.user;

  const friends = user.friends || [];

  const lastFriend = friends[friends.length - 1];
  const hasMore = user.friendIds.some(
    (friendId) => lastFriend && friendId < lastFriend._id
  );

  const responseFriends = await Promise.all(
    friends.map(async (friend) => {
      console.log(friend);
      if (!friend.user) {
        // TODO: return error response;
        console.trace();
        throw new Error('not implemented');
      }

      const areUsersFriends = friend.user.friendIds.includes(authUser._id);

      const { friendIds, ...rest } = friend.user.toJSON();

      const responseFriend = {
        ...friend.toObject(),
        user: rest,
      };

      return {
        ...responseFriend,
        areUsersFriends,
      };
    })
  );

  res.status(SUCCESS).json({
    data: {
      friends: responseFriends,
      hasMore,
    },
  });
};
