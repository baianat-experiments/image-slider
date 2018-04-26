const fs = require('fs');
const path = require('path');
const uglify = require('uglify-js').minify;
const chalk = require('chalk');

const { rollup } = require('rollup');
const { script, utils } = require('./config');

const isProduction = process.env.MODE === 'production';

function getModuleName (filename) {
  const module = filename.split('/').pop();
  return module.charAt(0).toUpperCase() + module.slice(1);
}

async function build (filename, mode = 'umd', minified = false) {
  console.log(chalk.cyan(`📦  Generating ${mode} ${filename}...`));

  const outputName = mode === 'es' ? `${filename}.esm` : filename
  // get the rollup bundle.
  const bundle = await rollup({
    input: path.join(script.paths.src, filename),
    ...script.inputOptions
  });

  // pass the desired output config
  const { code } = await bundle.generate({
    format: mode,
    name: getModuleName(filename),
    banner: script.banner
  });

  const distPath = path.join(script.paths.dist, `${outputName}.js`);

  // write the un-minified code.
  fs.writeFileSync(distPath, code);
  let stats = isProduction ? utils.stats({ path: distPath, code }) : '';
  console.log(`${chalk.green(`👍  ${outputName}.js`.padEnd(25, ' '))} ${stats}`);

  // write the minified code.
  if (!isProduction || !minified || mode === 'es') {
    return;
  }
  const minPath = path.join(script.paths.dist, `${outputName}.min.js`);
  fs.writeFileSync(minPath, uglify(code, script.uglifyOptions).code);
  stats = utils.stats({ path: minPath, code });
  console.log(`${chalk.green(`👍  ${outputName}.min.js`.padEnd(25, ' '))} ${stats}`);
}

async function buildScripts (mode) {
  build('flow', mode, true);
  const plugins = fs.readdirSync(script.paths.plugins);
  plugins.forEach(pluginFile => {
    const pluginName = pluginFile.split('.')[0];
    build(`plugins/${pluginName}`, mode, true);
  });
}

buildScripts('umd');
buildScripts('es');

module.exports = { buildScripts };
