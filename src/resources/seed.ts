import 'dotenv/config';
import { init } from '@src/config/database';
import { clearComments, seedComments } from './comment/comment.factory';
import { clearPosts, seedPosts } from './post/post.factory';
import { clearShares, seedShares } from './post/share.factory';
import { clearUsers, seedUsers } from './user/user.factory';
import {
  clearReactions,
  seedReactionsInPost,
} from './reaction/reaction.factory';
import db from '@src/config/database';
import { ClientSession } from 'mongoose';
import {
  USER_SIZE,
  POST_SIZE,
  REACTION_SIZE,
  COMMENT_SIZE,
  SHARE_SIZE,
} from './seed.config.js';

const clear = async (session: ClientSession) => {
  await clearUsers(session);
  await clearPosts(session);
  await clearReactions(session);
  await clearComments(session);
  await clearShares(session);
};

const seed = async (session: ClientSession, models: string[]) => {
  if (models.length === 0) {
    await seedUsers({ session, size: USER_SIZE });
    await seedPosts({ session, size: POST_SIZE, userCount: USER_SIZE });
    await seedReactionsInPost({
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

    if (models.includes('reaction')) {
      await seedReactionsInPost({
        session,
        size: REACTION_SIZE,
        postCount: POST_SIZE,
        userCount: USER_SIZE,
      });
    }
  }
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
