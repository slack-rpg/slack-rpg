'use strict';

const test = require('blue-tape');
const GameMaster = require(process.env.PWD + '/lib/gamemaster');

test('Game Master: Should parse dice commands', (assert) => {
  const gm = new GameMaster('foo');

  assert.deepEqual(gm.parseDice('1d4'), { num: 1, sides: 4, modifier: 0 }, 'Parse 1d4');
  assert.deepEqual(gm.parseDice('2d10+3'), { num: 2, sides: 10, modifier: 3 }, 'Parse 2d10+3');
  assert.deepEqual(gm.parseDice('4d3-1'), { num: 4, sides: 3, modifier: -1 }, 'Parse 4d3-1');

  assert.throws(gm.parseDice.bind(null), /Empty or Non\-String Dice Command/, 'Throw on null');
  assert.throws(gm.parseDice.bind(null, {}), /Empty or Non\-String Dice Command/, 'Throw on object');
  assert.throws(gm.parseDice.bind(null, '1d'), /Invalid Dice Command: 1d/, 'Throw missing sides');
  assert.throws(gm.parseDice.bind(null, 'd4'), /Invalid Dice Command: d4/, 'Throw missing num');
  assert.throws(gm.parseDice.bind(null, '1d4foo'), /Invalid Dice Command: 1d4foo/, 'Throw on invalid modifier');

  assert.end();
});

test('Game Master: Should roll dice', (assert) => {
  const gm = new GameMaster('foo');

  assert.ok(gm.roll('1d4'), 'Roll a 1d4');
  assert.throws(gm.roll.bind(gm), /Empty or Non\-String Dice Command/, 'Pass through dice parsing errors');
  assert.throws(gm.roll.bind(gm, 'foo'), /Invalid Dice Command: foo/, 'Pass through dice parsing errors');

  assert.end();
});

test('Game Master: Should load addons', (assert) => {
  assert.plan(2);
  const gm = new GameMaster('foo');

  gm.loadAddons('slack-rpg/addon-official').then((addons) => {
    assert.ok(addons, 'Load slack-rpg/addon-official');
  }, (error) => {
    assert.fail(`Official Repo should fetch correctly: ${error.message}`);
  });

  gm.loadAddons('not/real').then(() => {
    assert.fail('Invalid repo should not have succeeded');
  }, (error) => {
    assert.ok(error, 'Game Master should reject unknown repo');
  });
});

test('Game Master: Should get loaded namespaces', (assert) => {
  assert.plan(2);
  const gm = new GameMaster('foo');

  assert.deepEqual(
    gm.getAddonNamespaces(),
    [],
    'Game Master should have no namespaces until addon(s) are loaded'
  );

  gm.loadAddons('slack-rpg/addon-official').then(() => {
    assert.deepEqual(
      gm.getAddonNamespaces(),
      ['slack-rpg/addon-official/default'],
      'Parse an object into namespaces'
    );
  }, (error) => {
    assert.fail(`Official Repo should fetch correctly: ${error.message}`);
  });
});

test('Game Master: Should parse commands', (assert) => {
  const gm = new GameMaster('foo');

  assert.deepEqual(gm.parseCommands(''), [], 'No commands if empty string');
  assert.deepEqual(gm.parseCommands('foo'), [], 'No commands if have no command');
  assert.deepEqual(
    gm.parseCommands('roll 1d6'),
    [
      {
        command: gm.commands.roll,
        args: ['1d6'],
      },
    ],
    'Parse a roll command (roll 1d6)'
  );

  assert.deepEqual(
    gm.parseCommands('roll 1d4+1'),
    [
      {
        command: gm.commands.roll,
        args: ['1d4+1'],
      },
    ],
    'Parse a roll command (roll 1d4+1)'
  );

  assert.deepEqual(
    gm.parseCommands('roll 1d10-3'),
    [
      {
        command: gm.commands.roll,
        args: ['1d10-3'],
      },
    ],
    'Parse a roll command (roll 1d10-3)'
  );

  assert.end();
});

test('Game Master: Execute Commands', (assert) => {
  assert.plan(2);

  const gm = new GameMaster('foo');

  gm.command('foo').then(() => {
    assert.fail('Foo should not parse into a command');
  }, (error) => {
    assert.equal(error.message, 'No commands found: undefined', 'Reject promise when no commands found.');
  });

  gm.command('foo', 'foo').then(() => {
    assert.fail('Foo should not parse into a command');
  }, (error) => {
    assert.equal(error.message, 'No commands found: foo', 'Reject promise when invalid commands found.');
  });
});


test('Game Master: Execute Command Roll', (assert) => {
  assert.plan(3);

  const gm = new GameMaster('foo');

  gm.command('foo', 'roll 1d6').then((responses) => {
    assert.ok(
      /^1d6: \d+ \(Pure: \d+ \[[1-6]\]\)$/.test(responses[0].message),
      `Parse 'roll 1d6' into a single response (${responses[0].message})`
    );
  }, (error) => {
    assert.fail(`Error parsing 'roll 1d6': ${error.message}`);
  });

  gm.command('foo', 'roll 1d4+1').then((responses) => {
    assert.ok(
      /^1d4\+1: \d+ \(Pure: \d+ \[[1-4]\]\)$/.test(responses[0].message),
      `Parse 'roll 1d4+1' into a single response (${responses[0].message})`
    );
  }, (error) => {
    assert.fail(`Error parsing 'roll 1d4+1': ${error.message}`);
  });

  gm.command('foo', 'roll 2d4-1').then((responses) => {
    assert.ok(
      /^2d4-1: \d+ \(Pure: \d+ \[[1-4], [1-4]\]\)$/.test(responses[0].message),
      `Parse 'roll 2d4-1' into a single response (${responses[0].message})`
    );
  }, (error) => {
    assert.fail(`Error parsing 'roll 2d4-1': ${error.message}`);
  });
});
