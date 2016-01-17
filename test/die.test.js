'use strict';

const test = require('blue-tape');
const Die = require(process.env.PWD + '/lib/die');

test('Die: Should roll various types of dice', (assert) => {
  const r1d4 = Die.roll(1, 4);
  assert.ok(r1d4.total > 0 && r1d4.total < 5, `1d4: should be between 0 and 5 (${r1d4.total})`);
  assert.equal(r1d4.dice.length, 1, '1d4: should only roll one die');
  assert.equal(r1d4.total, r1d4.pure, '1d4: should not add any modifier');

  const r2d10 = Die.roll(2, 10);
  assert.ok(r2d10.total > 1 && r2d10.total < 21,
    `2d10: should be between 1 and 21 (${r2d10.total})`);
  assert.equal(r2d10.dice.length, 2, '2d10: should only roll two dice');

  const r4d6 = Die.roll(4, 6, 5);
  assert.ok(r4d6.total > 9 && r4d6.total < 30, `4d6+5: should be between 9 and 30 (${r4d6.total})`);
  assert.ok(r4d6.pure > 3 && r4d6.pure < 25,
    `4d6+5: pure should be between 3 and 25 (${r4d6.pure})`);
  assert.equal(r4d6.dice.length, 4, '4d6+5: should only roll four dice');
  assert.equal(r4d6.pure + 5, r4d6.total, '4d6+5: pure dice roll plus modifier should equal total');

  assert.end();
});

test('Die: Should throw errors on invalid inputs', (assert) => {
  assert.throws(
    Die.roll.bind(null),
    /Number of dice must be > 0/,
    'Throw error on empty number of dice'
  );

  assert.throws(
    Die.roll.bind(null, -1),
    /Number of dice must be > 0/,
    'Throw error on negative number of dice'
  );

  assert.throws(
    Die.roll.bind(null, 0),
    /Number of dice must be > 0/,
    'Throw error on zero number of dice'
  );

  assert.throws(
    Die.roll.bind(null, Die.MAX_DICE + 1),
    /I will not roll more than 100 dice!/,
    'Throw error on large number of dice'
  );

  assert.throws(
    Die.roll.bind(null, 1),
    /Number of sides must be > 1/,
    'Throw error on empty number of sides'
  );
  assert.throws(
    Die.roll.bind(null, 1, -1),
    /Number of sides must be > 1/,
    'Throw error on negative number of sides'
  );

  assert.throws(
    Die.roll.bind(null, 1, 0),
    /Number of sides must be > 1/,
    'Throw error on zero number of sides'
  );

  assert.throws(
    Die.roll.bind(null, 1, 1),
    /Number of sides must be > 1/,
    'Throw error on one number of sides'
  );

  assert.throws(
    Die.roll.bind(null, 1, Die.MAX_SIDES + 1),
    /I will not roll more than 100 sides!/,
    'Throw error on large number of sides'
  );

  assert.throws(
    Die.roll.bind(null, 1, 4, Die.MAX_MODIFIER + 1),
    /I will not add a modifier of more than \+\/\-100!/,
    'Throw error on large modifier'
  );

  assert.throws(
    Die.roll.bind(null, 1, 4, Die.MAX_MODIFIER * -1 - 1),
    /I will not add a modifier of more than \+\/\-100!/,
    'Throw error on small modifier'
  );

  assert.end();
});

test('Die: Should format roll into human readable string', (assert) => {
  const r1d4 = Die.roll(1, 4);
  assert.ok(/^1d4: \d+ \(Pure: \d+ \[[1-4]\]\)$/.test(r1d4.toString()),
    `Follow format: xdx: xx (Pure: xx [x]) (${r1d4.toString()})`);

  const r4d6 = Die.roll(4, 6, 5);
  assert.ok(/^4d6\+5: \d+ \(Pure: \d+ \[[1-6], [1-6], [1-6], [1-6]\]\)$/.test(r4d6.toString()),
    `Follow format: xdx+x: xx (Pure: xx [x, x, x, x]) (${r4d6.toString()})`);

  const r2d20 = Die.roll(2, 20, -2);
  assert.ok(/^2d20\-2: \d+ \(Pure: \d+ \[\d+, \d+\]\)$/.test(r2d20.toString()),
    `Follow format: xdx-x: xx (Pure: xx [x, x]) (${r2d20.toString()})`);

  assert.end();
});
