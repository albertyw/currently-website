const $ = require('jquery');

require('./rollbar');
require('./google');
const clock = require('./clock');
$(clock.start);

const loadWeather = require('./weather').load;
const loadLocation = require('./location').load;
$(loadWeather);
$(loadLocation);

const demo = require('./demo');
demo.bindDemo();

require('./calendar');
require('./logfit');

const pageRefresher = require('./refresh');
pageRefresher();
