const browserifyMiddleware = require('browserify-middleware');
const console = require('console');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const mustache = require('mustache');
const path = require('path');
const Rollbar = require('rollbar');
const rfs = require('rotating-file-stream');

require('dotenv').config({path: path.join(__dirname, '..', '.env')});
const util = require('./util');

const app = express();
const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_SERVER_ACCESS,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

// Set up logging
app.use(morgan('combined'));
const accessLogStream = rfs('access.log', {
  interval: '1d',
  path: path.join(__dirname, '..', 'logs', 'app')
});
app.use(morgan('combined', {stream: accessLogStream }));
app.use(rollbar.errorHandler());

// Set up mustache
// To set functioning of mustachejs view engine
app.engine('html', function (filePath, options, callback) {
  fs.readFile(filePath, function (err, content) {
    if(err) {
      return callback(err);
    }
    const rendered = mustache.to_html(content.toString(),options);
    return callback(null, rendered);
  });
});
app.set('views', path.join(__dirname, '..', 'codemancer'));
app.set('view engine','html');

app.locals.svg = util.getSVGs();
app.locals.templateVars = {
  SEGMENT_TOKEN: process.env.SEGMENT_TOKEN,
  LOGFIT_TOKEN: process.env.LOGFIT_TOKEN,
  SUNRISESUNSET_SVG: app.locals.svg.sunrisesunset,
  TOGGLEDEMO_SVG: app.locals.svg.toggledemo,
  CALENDAR_AUTH_SVG: app.locals.svg.calendarAuth,
  CALENDAR_SIGNOUT_SVG: app.locals.svg.calendarSignout,
  JAVASCRIPT: util.getJSFileName(),
};


app.get('/', (req, res) => {
  res.render('index', app.locals.templateVars);
});
app.use('/css', express.static(path.join(__dirname, '..', 'codemancer', 'css')));
app.use('/font', express.static(path.join(__dirname, '..', 'codemancer', 'font')));
app.use('/img', express.static(path.join(__dirname, '..', 'codemancer', 'img')));
if (process.env.ENVIRONMENT == 'development') {
  const browserifyOptions = {
    transform: ['envify']
  };
  const jsFile = path.join(__dirname, '..', 'codemancer', 'js', 'index.js');
  const browserifyHandler = browserifyMiddleware(jsFile, browserifyOptions);
  app.use('/js/' + util.getJSFileName(), browserifyHandler);
} else {
  app.use('/js', express.static(path.join(__dirname, '..', 'codemancer', 'js')));
}

const port = process.env.LISTEN_PORT;
app.listen(port, () => {
  console.log('Listening on port ' + port);
});
