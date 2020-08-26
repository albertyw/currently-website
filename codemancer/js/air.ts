import $ = require('jquery');
import process = require('process');

import {Location} from './location';
import util = require('./util');
import varsnap = require('./varsnap');

const AIRNOW_API_KEY = process.env.AIRNOW_API_KEY;
const airnowProxyURL = '/airnow/';
const airnowProxyExpiration = 10 * 60 * 1000;

export const Air = {
  dom: $('#air-message'),

  urlBuilder: varsnap(function urlBuilder(location) {
    let url = airnowProxyURL;
    url += '?latitude=' + encodeURIComponent(location.lat);
    url += '&longitude=' + encodeURIComponent(location.lng);
    url += '&API_KEY=' + encodeURIComponent(AIRNOW_API_KEY);
    url += '&format=application/json';
    return url;
  }),

  getAirQuality: function getAirQuality(): Promise<Record<string, unknown>> {
    const url = Air.urlBuilder(Location.targetLocation);
    return util.requestPromise(url, airnowProxyExpiration);
  },

  showAirQuality: function showAirQuality(): void {
    Air.getAirQuality().then(function(data: any) {
      if (data[0].Category.Number !== 1) {
        const message = 'Air Quality: ' + data[0].Category.Name;
        Air.dom.text(message);
      }
    });
  }

};

export function main(): void {
  Air.showAirQuality();
}