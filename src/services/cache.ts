import cache from '@src/config/cache.config';

export const getSetCount = (key: string) =>
  new Promise<number>((resolve, reject) => {
    cache.scard(key, (err, count) => {
      if (err) {
        reject(err);
      }
      resolve(count);
    });
  });

export const addToSet = (key: string, ...values: string[]) =>
  new Promise<number>((resolve, reject) => {
    cache.sadd(key, ...values, (err, reply) => {
      if (err) {
        reject(err);
      }
      resolve(reply);
    });
  });

export const removeFromSet = (key: string, ...values: string[]) =>
  new Promise<number>((resolve, reject) => {
    cache.srem(key, ...values, (err, reply) => {
      if (err) {
        reject(err);
      }
      resolve(reply);
    });
  });
