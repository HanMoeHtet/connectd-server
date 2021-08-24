const fs = require('fs');
const JSON5 = require('json5');
const tsConfigPaths = require('tsconfig-paths');

const tsConfig = JSON5.parse(fs.readFileSync('./tsconfig.json', 'utf8'));

tsConfigPaths.register({
  baseUrl: './',
  paths: {
    '@src/*': ['./build/*'],
  },
});
