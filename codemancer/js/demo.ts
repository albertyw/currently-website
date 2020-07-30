import $ = require('jquery');

import background = require('./background');
import util = require('./util');

const originalUpdateBackgroundColorPeriod = background.updateBackgroundColorPeriod;

function startDemo() {
  background.updateBackgroundColorPeriod = 500;
  background.updateBackgroundColor();
}

function stopDemo() {
  background.updateBackgroundColorPeriod = originalUpdateBackgroundColorPeriod;
}

function toggleDemo() { // eslint-disable-line no-unused-vars
  const demoOn = util.toggleDemo();
  if (demoOn) {
    stopDemo();
  } else {
    startDemo();
  }
}

function bindDemo() {
  $('#toggle_demo').click(toggleDemo);
}

module.exports = {
  bindDemo: bindDemo,
};
