'use strict';

const test = require('blue-tape');
const Bot = require(process.env.PWD + '/lib/bot');
const configDist = require(process.env.PWD + '/config.default.js');

test('Bot: instantiate and set config', (assert) => {
  const bot = new Bot(configDist);
  assert.equal(bot.config, configDist, 'Bot\'s config should equal passed in config');
  assert.end();
});

test('Bot: Announce Slack Open', (assert) => {
  const bot = new Bot(configDist);
  assert.ok(
    bot.slackOpen({
      self: { name: 'you' },
      team: { name: 'team' },
      channels: [
        { is_member: true, name: 'foo' },
      ],
      groups: [
        { name: 'bar' },
      ],
      mpims: [
        { name: 'mpim' },
      ],
    }),
    'Bot should announce connected channels'
  );
  assert.end();
});

test('Bot: Populate Lookups', (assert) => {
  const bot = new Bot(configDist);
  const payload = {
    self: { name: 'you' },
    team: { name: 'team' },
    channels: [
      { id: 'foo', is_member: true, name: 'foo' },
    ],
    groups: [
      { id: 'bar', name: 'bar' },
    ],
    mpims: [
      { id: 'mpim', name: 'mpim' },
    ],
  };
  bot.populateLookup(payload);

  assert.deepEqual(bot.lookup.get('bar'), payload.groups[0], 'Lookup should be populated');

  assert.end();
});
