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

const clear = async (session: ClientSession) => {
  await clearUsers(session);
  await clearPosts(session);
  await clearReactions(session);
  await clearComments(session);
  await clearShares(session);
};

const seed = async (session: ClientSession, models: string[]) => {
  if (models.length === 0) {
    await seedUsers(session);
    await seedPosts(session);
    await seedReactionsInPost(session);
    await seedComments(session);
    await seedShares(session);
  } else {
    if (models.includes('user')) {
      await seedUsers(session);
    }

    if (models.includes('post')) {
      await seedPosts(session);
    }

    if (models.includes('comment')) {
      await seedComments(session);
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
