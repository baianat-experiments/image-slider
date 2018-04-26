const path = require('path');
const fs = require('fs');
const filesize = require('filesize');
const gzipSize = require('gzip-size');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');

const { version } = require('../package.json');

module.exports = {
  script: {
    banner:
    `/**
    * v${version}
    * (c) ${new Date().getFullYear()} Baianat
    * @license MIT
    */`,
    paths: {
      src: path.join(__dirname, '../src/js'),
      plugins: path.join(__dirname, '../src/js/plugins'),
      dist: path.join(__dirname, '../dist/js')
    },
    uglifyOptions: {
      toplevel: true,
      compress: true,
      mangle: true
    },
    inputOptions: {
      plugins: [
        replace({ __VERSION__: version }),
        resolve(),
        babel()
      ]
    }
  },
  style: {
    src: path.join(__dirname, '../src/stylus'),
    plugins: path.join(__dirname, '../src/stylus/plugins'),
    dist: path.join(__dirname, '../dist/css'),
    app: path.join(__dirname, '../src/stylus/app.styl'),
  },
  utils: {
    stats ({ path, code }) {
      const { size } = fs.statSync(path);
      const gzipped = gzipSize.sync(code);

      return `Size: ${filesize(size).padStart(9, ' ')} | Gzip: ${filesize(gzipped).padStart(9, ' ')}`;
    }
  }
};
