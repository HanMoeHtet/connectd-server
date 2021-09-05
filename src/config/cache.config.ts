import redis from 'redis';

const cache = redis.createClient({
  url: process.env.REDIS_URL,
});

export const init = () =>
  new Promise<void>((resolve, reject) => {
    // Fix for ts-node-dev reloading the app
    // when the redis client is already connected
    if (cache.connected) {
      console.log('Redis already connected');
      resolve();
    }
    cache.on('ready', () => {
      console.log('Redis ready');
      resolve();
    });
    cache.on('error', (err) => {
      console.error(err);
      reject(err);
    });
  });

export default cache;
