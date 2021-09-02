import redis from 'redis';

const cache = redis.createClient({
  url: process.env.REDIS_URL,
});

export const init = () =>
  new Promise<void>(async (resolve, reject) => {
    cache.on('ready', () => {
      console.log('Redis connected');
      resolve();
    });
    cache.on('error', (err) => {
      reject(err);
    });
  });

export default cache;
