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

  assert.ok(gm.roll('foo', '1d4'), 'Roll a 1d4');

  assert.throws(gm.roll.bind(null), /Invalid playerId: undefined/, 'Throw when missing playerId');
  assert.throws(gm.roll.bind(gm, 'foo'), /Empty or Non\-String Dice Command/, 'Pass through dice parsing errors');

  assert.end();
});
