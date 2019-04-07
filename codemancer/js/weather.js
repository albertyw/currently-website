const $ = require('jquery');

const Rollbar = require('./rollbar');
const Location = require('./location');

const weatherRefreshInterval = 20 * 60 * 1000;
// Icons are from https://erikflowers.github.io/weather-icons/
// Conditions are from https://graphical.weather.gov/xml/xml_fields_icon_weather_conditions.php
const weatherIconConversions = {
  'Sunny': '\uf00d',
  'Clear': '\uf00d',
  'Cloudy': '\uf013',
  'Mostly Cloudy': '\uf041',
  'Partly Cloudy': '\uf002',
  'Rain Showers': '\uf009',
  'Light Rain': '\uf009',
  'Rain': '\uf008',
  'Heavy Rain': '\uf04e',
  'Showers And Thunderstorms': '\uf00e',
};
const descriptors = ['Mostly', 'Partly', 'Slight Chance', 'Chance', 'Likely', 'Isolated'];
const weatherLookForwardHours = 24;

function chainAccessor(data, properties) {
  let value = data;
  for(let x=0; x<properties.length; x++) {
    value = value && value[properties[x]];
  }
  return value;
}

const Weather = {

  $el: {
    now : $('.now'),
    city : $('#city')
  },

  urlBuilder: function(location) {
    // Documentation at https://www.weather.gov/documentation/services-web-api#/
    const url = 'https://api.weather.gov/gridpoints/' + location.wfo + '/'
      + location.x + ',' + location.y + '/forecast/hourly';
    return url;
  },

  atLocation: function () {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', Weather.urlBuilder(Location.targetLocation));
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send();
    }).then((data) => {
      data = JSON.parse(data);
      return Location.getDisplayName(Location.targetLocation).then(function(name) {
        data.locationDisplayName = name;
        return data;
      });
    })
    .then(Weather.parse);
  },

  parse: function(data) {
    // Lets only keep what we need.
    const w2 = {};
    w2.city = data.locationDisplayName;
    w2.currentTemp = Math.round(chainAccessor(data, ['properties', 'periods', 0, 'temperature']));
    w2.minTemp = w2.currentTemp;
    w2.maxTemp = w2.currentTemp;
    w2.conditionSequence = [chainAccessor(data, ['properties', 'periods', 0, 'shortForecast'])];
    for (let i = 0; i < weatherLookForwardHours; i++) {
      if (i >= data.properties.periods.length) {
        break;
      }
      const period = data.properties.periods[i];
      const temp = Math.round(chainAccessor(period, ['temperature']));
      w2.minTemp = Math.min(w2.minTemp, temp);
      w2.maxTemp = Math.max(w2.maxTemp, temp);

      const condition = period.shortForecast;
      if(w2.conditionSequence[w2.conditionSequence.length-1] != condition) {
        w2.conditionSequence.push(condition);
      }
    }
    for (let i=0; i < w2.conditionSequence.length; i++) {
      w2.conditionSequence[i] = Weather.conditionIcon(w2.conditionSequence[i]);
    }
    return w2;
  },

  conditionIcon: function (condition){
    let weatherIconCode = weatherIconConversions[condition];
    if (weatherIconCode !== undefined) {
      return weatherIconCode;
    }
    for (let i=0; i<descriptors.length; i++) {
      condition = condition.replace(descriptors[i], '');
    }
    condition = condition.replace(/^\s+|\s+$/g, '');
    weatherIconCode = weatherIconConversions[condition];
    if (weatherIconCode !== undefined) {
      return weatherIconCode;
    }
    Rollbar.error('cannot find image for "' + condition + '"');
    return '\uf04c';
  },

  render: function(wd) {
    // Set Current Information
    Weather.renderDay(Weather.$el.now, wd);
    Weather.$el.city.html(wd.city).show();

    // Show Weather
    $('#weather-inner').removeClass('hidden').show();
  },

  renderDay: function(el, data) {
    el.find('.condition').html(data.conditionSequence[0]);
    el.find('.min-temp').html(data.minTemp);
    el.find('.current-temp').html(data.currentTemp);
    el.find('.max-temp').html(data.maxTemp);
  },

  load: function() {
    return Weather.atLocation();
  }
};

function main() {
  const loader = Weather.load().then(function(data) {
    Weather.render(data);
  }, function(error) {
    Rollbar.error(error);
  });
  setInterval(main, weatherRefreshInterval);
}

module.exports = {
  chainAccessor: chainAccessor,
  load: main,
  Weather: Weather,
};
