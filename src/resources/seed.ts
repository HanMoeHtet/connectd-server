import db, { init } from '@src/config/database.config';
import 'dotenv/config';
import { ClientSession } from 'mongoose';
import { clearComments, seedComments } from './comment/comment.factory';
import { clearFriendRequests } from './friend-request/friend-request.factory';
import { clearFriends } from './friend/friend.factory';
import { clearNotifications } from './notification/notification.factory';
import { clearPosts, seedPosts } from './post/post.factory';
import { clearShares, seedShares } from './post/share.factory';
import {
  clearReactionsInComments,
  seedReactionsInComments,
} from './reaction/reaction-in-comment.factory';
import {
  clearReactionsInPosts,
  seedReactionsInPosts,
} from './reaction/reaction-in-post.factory';
import { clearReactionsInReplies } from './reaction/reaction-in-reply';
import { clearReplies } from './reply/reply.factory';
import { clearUsers, seedUsers } from './user/user.factory';

const clear = async (session: ClientSession) => {
  await clearUsers(session);
  await clearPosts(session);
  await clearReactionsInPosts(session);
  await clearReactionsInComments(session);
  await clearReactionsInReplies(session);
  await clearComments(session);
  await clearReplies(session);
  await clearShares(session);
  await clearNotifications(session);
  await clearFriends(session);
  await clearFriendRequests(session);
};

const seed = async (session: ClientSession, models: string[]) => {
  const { COMMENT_SIZE, POST_SIZE, REACTION_SIZE, SHARE_SIZE, USER_SIZE } =
    // @ts-ignore
    await import('./seed.config.js');

  if (models.length === 0) {
    await seedUsers({ session, size: USER_SIZE });
    await seedPosts({ session, size: POST_SIZE, userCount: USER_SIZE });
    await seedReactionsInPosts({
      session,
      size: REACTION_SIZE,
      postCount: POST_SIZE,
      userCount: USER_SIZE,
    });
    await seedComments({
      session,
      size: COMMENT_SIZE,
      postCount: POST_SIZE,
      userCount: USER_SIZE,
    });
    await seedReactionsInComments({
      session,
      size: REACTION_SIZE,
      commentCount: COMMENT_SIZE,
      userCount: USER_SIZE,
    });
    await seedShares({
      session,
      size: SHARE_SIZE,
      postCount: POST_SIZE,
      userCount: USER_SIZE,
    });
  } else {
    if (models.includes('user')) {
      await seedUsers({ session, size: USER_SIZE });
    }

    if (models.includes('post')) {
      await seedPosts({ session, size: POST_SIZE, userCount: USER_SIZE });
    }

    if (models.includes('comment')) {
      await seedComments({
        session,
        size: COMMENT_SIZE,
        postCount: POST_SIZE,
        userCount: USER_SIZE,
      });
    }

    if (models.includes('share')) {
      await seedShares({
        session,
        size: SHARE_SIZE,
        postCount: POST_SIZE,
        userCount: USER_SIZE,
      });
    }

    if (models.includes('reaction-in-post')) {
      await seedReactionsInPosts({
        session,
        size: REACTION_SIZE,
        postCount: POST_SIZE,
        userCount: USER_SIZE,
      });
    }

    if (models.includes('reaction-in-comment')) {
      await seedReactionsInComments({
        session,
        size: REACTION_SIZE,
        commentCount: COMMENT_SIZE,
        userCount: USER_SIZE,
      });
    }
  }
};

const oneTimeRun = async (session: ClientSession) => {
  // @ts-ignore
  const { run } = await import('./one-time-run');
  await run(session);
};

const run = async () => {
  await init();
  const session = await db.startSession();

  const [cmd, ...models] = process.argv.slice(2);
  try {
    await session.withTransaction(async () => {
      switch (cmd) {
        case 'clear':
          await clear(session);
          break;
        case 'seed':
          await seed(session, models);
          break;
        case 'refresh':
          await clear(session);
          await seed(session, models);
          break;
        case 'oneTime':
          await oneTimeRun(session);
          break;
        default:
          console.log(`Unknown argument: ${cmd}`);
      }
    });
  } catch (e) {
    console.error(e);
    console.warn('Transaction aborted.');
  } finally {
    session.endSession();
  }
  process.exit(0);
};

run();
