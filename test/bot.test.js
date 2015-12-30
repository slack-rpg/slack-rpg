'use strict';

const test = require('blue-tape');
const Bot = require(process.env.PWD + '/lib/bot');
const configDist = require(process.env.PWD + '/config.default.js');

test('Bot: instantiate and set config', (assert) => {
  const bot = new Bot(configDist);
  assert.equal(bot.config, configDist, 'Bot\'s config should equal passed in config');
  assert.end();
});
