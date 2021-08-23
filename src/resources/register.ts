import { promises } from 'fs';
import { resolve } from 'path';

const models_path = __dirname;

export const register = async (dir: string = models_path) => {
  const dirents = await promises.readdir(dir, { withFileTypes: true });
  await Promise.all(
    dirents.map(async (dirent) => {
      const res = resolve(dir, dirent.name);
      if (res.endsWith('.model.ts') || res.endsWith('.model.js')) {
        require(res);
      }
      if (dirent.isDirectory()) {
        await register(res);
      }
    })
  );
};
