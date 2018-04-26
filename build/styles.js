const fs = require('fs');
const chalk = require('chalk');
const stylus = require('stylus');
const path = require('path');
const uglifycss = require('uglifycss');
const autoprefixer = require('autoprefixer-stylus');

const { style, utils } = require('./config');

const isProduction = process.env.MODE === 'production';

function buildStyles () {
  console.log(chalk.cyan('📦  Generating Stylesheets...'));
  const app = fs.readFileSync(style.app, 'utf8');
  const plugins = fs.readdirSync(style.plugins);
  stylusToCSS(app, 'flow');
  plugins.forEach(pluginFile => {
    const pluginName = pluginFile.split('.')[0];
    stylusToCSS(fs.readFileSync(`${style.plugins}/${pluginFile}`, 'utf8'), `plugins/${pluginName}`);
  });
}

function stylusToCSS (styl, name) {
  stylus(styl)
    .include(style.src)
    .use(autoprefixer({ browsers: ['last 5 version'] }))
    .render((err, css) => {
      if (err) {
        throw err;
      }
      const filePath = path.join(style.dist, `${name}.css`);
      fs.writeFileSync(filePath, css);
      let stats = isProduction ? utils.stats({ path: filePath, code: css }) : '';
      console.log(`${chalk.green(`👍  ${name}.css`.padEnd(25, ' '))} ${stats}`);

      if (!isProduction) return;
      const minPath = path.join(style.dist, `${name}.min.css`);
      const uglifiedCss = uglifycss.processString(css);
      fs.writeFileSync(minPath, uglifiedCss);
      stats = utils.stats({ path: minPath, code: uglifiedCss });
      console.log(`${chalk.green(`👍  ${name}.min.css`.padEnd(25, ' '))} ${stats}`);
    });
}

module.exports = { buildStyles };

buildStyles();
