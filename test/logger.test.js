'use strict';

const test = require('blue-tape');

test('Logger: create an instance of logger', (assert) => {
  const logger = require(process.env.PWD + '/lib/logger')();
  assert.ok(logger, 'Logger should be instantiated');
  assert.end();
});
