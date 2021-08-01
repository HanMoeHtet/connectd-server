import fs from 'fs';
import path from 'path';

const models_path = __dirname;

export const register = () => {
  fs.readdirSync(models_path).forEach((file) => {
    console.log(file);
    if (file.indexOf('.ts') !== -1) {
      require(path.join(__dirname, '/', file));
    }
  });
};
