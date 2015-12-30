'use strict';

const test = require('blue-tape');
const Config = require(process.env.PWD + '/lib/config');
const rawConfig = require(process.env.PWD + '/config.default');

test('Config: Config: parse the string \'true\' into a boolean true', (assert) => {
  assert.equal(Config.parseBool('true'), true, '"true" should be true');
  assert.equal(Config.parseBool('True'), true, '"True" should be true');
  assert.equal(Config.parseBool('TRUE'), true, '"TRUE" should be true');
  assert.end();
});

test('Config: parse the string \'1\' into a boolean true', (assert) => {
  assert.equal(Config.parseBool('1'), true, '"1" should be true');
  assert.end();
});

test('Config: parse any other string into a boolean false', (assert) => {
  assert.equal(Config.parseBool('false'), false, '"false" should be false');
  assert.equal(Config.parseBool('lksjfljksdf'), false, '"lksjfljksdf" should be false');
  assert.equal(Config.parseBool('nope'), false, '"nope" should be false');
  assert.end();
});

test('Config: pass the original value if not a string', (assert) => {
  assert.equal(Config.parseBool(1), 1, '1 should be 1');
  assert.end();
});

test('Config: parse default config as is', (assert) => {
  assert.equal(Config.parse(rawConfig), rawConfig, 'Config should pass through as is');
  assert.end();
});

test('Config: use env values over file values', (assert) => {
  process.env.SLACK_TOKEN = 'foo';
  const conf = Config.parse(rawConfig);

  assert.equal(conf.slack.token, 'foo', 'Slack Token should be "foo"');
  assert.end();
});

test('Config: throw an error if config is not an object', (assert) => {
  assert.throws(Config.parse.bind(null, 'foo'), /Config is not an object/, 'Invalid objects should throw an error');
  assert.end();
});
