import fs = require('fs');
import path = require('path');

import browserify = require('browserify');
require('dotenv').config();
import util = require('../server/util');

const inputFile = path.join(__dirname, '..', 'codemancer', 'js', 'index.js');
const outputFile = path.join(__dirname, '..', 'codemancer', 'js', util.getJSFileName());

browserify(inputFile, {debug: true})
  .transform('envify')
  .transform('babelify',  {presets: ['@babel/preset-env']})
  .transform('uglifyify', {compress: true, 'keep_fnames': true, global: true})
  .bundle()
  .pipe(fs.createWriteStream(outputFile));