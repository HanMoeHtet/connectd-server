const fs = require('fs');
const JSON5 = require('json5');
const tsConfigPaths = require('tsconfig-paths');

const tsConfig = JSON5.parse(fs.readFileSync('./tsconfig.json', 'utf8'));

const outDir = tsConfig.compilerOptions.outDir || '.';
const paths = tsConfig.compilerOptions.paths || {};

tsConfigPaths.register({
  baseUrl: outDir,
  paths: paths,
});
