'use strict';

const test = require('blue-tape');
const Addon = require(process.env.PWD + '/lib/addon');

test('Addon::fetchGitHub', (assert) => {
  assert.plan(3);

  Addon.fetchGitHub('foo').then(() => {
    assert.fail('Invalid repo should not have succeeded');
  }, (error) => {
    assert.ok(error, 'Addon should reject invalid repo');
  });

  Addon.fetchGitHub('not/real').then(() => {
    assert.fail('Invalid repo should not have succeeded');
  }, (error) => {
    assert.ok(error, 'Addon should reject unknown repo');
  });

  Addon.fetchGitHub('slack-rpg/slack-rpg').then((addon) => {
    assert.ok(addon, 'slack-rpg/offical-addon should be found and fetched');
  }, (error) => {
    assert.error(error, 'Addon should accept known repo');
  });
});

test('Addon::extract', (assert) => {
  assert.plan(4);

  Addon.extract().then(() => {
    assert.fail('Missing namespace should not have succeeded');
  }, (error) => {
    assert.equal(error.message, 'No namespace given', 'Addon should reject an missing namespace');
  });

  Addon.extract('foo', 'bar').then(() => {
    assert.fail('Invalid namespace should not have succeeded');
  }, (error) => {
    assert.equal(error.message, 'Invalid or unrecognized namespace: bar', 'Addon should reject an invalid namespace');
  });

  Addon.extract('foo', 'foo/bar').then(() => {
    assert.fail('Invalid zip should not have succeeded');
  }, (error) => {
    assert.equal(error.message, 'Zip Error: Invalid filename', 'Addon should reject an invalid zip');
  });

  Addon.fetchGitHub('slack-rpg/addon-official').then((addon) => {
    Addon.extract(addon, 'slack-rpg/addon-official').then((jsonAddon) => {
      assert.ok(jsonAddon, 'Extract sample addon');
    }, (error) => {
      assert.fail(`Official Repo should extract correctly: ${error.message}`);
    });
  }, (error) => {
    assert.error(error, 'Addon should accept known repo');
  });
});

test('Addon::parse', (assert) => {
  assert.deepEqual(Addon.parse(''), [], 'Empty string -> Empty Array');
  assert.deepEqual(Addon.parse('foo/bar'), ['foo/bar'], 'Parse a single addon');
  assert.deepEqual(Addon.parse('foo/bar,fizz/buzz'), ['foo/bar', 'fizz/buzz'], 'Parse multiple addons');
  assert.deepEqual(Addon.parse('foo/bar,  fizz/buzz'), ['foo/bar', 'fizz/buzz'], 'Parse multiple addons with spaces');

  assert.throws(Addon.parse.bind(null, 'foo'), /Invalid Addon Name: foo/, 'Throw error on invalid addon');

  assert.end();
});

test('Addon::fetch', (assert) => {
  assert.plan(3);

  Addon.fetch('slack-rpg/addon-official').then((addons) => {
    assert.ok(addons, 'Fetch slack-rpg/addon-official');
  }, (error) => {
    assert.fail(`Official Repo should fetch correctly: ${error.message}`);
  });

  Addon.fetch('not/real').then(() => {
    assert.fail('Invalid repo should not have succeeded');
  }, (error) => {
    assert.equal(error.message, 'GitHub responded with: 404', 'Addon should reject unknown repo');
  });

  Addon.fetch('parsefail').then(() => {
    assert.fail('Invalid repo should not have succeeded');
  }, (error) => {
    assert.equal(error.message, 'Invalid Addon Name: parsefail', 'Addon should pass through parse errors');
  });
});

test('Addon::getNamespaces', (assert) => {
  assert.deepEqual(
    Addon.getNamespaces({ foo: { bar: { bob: {} } } }),
    ['foo/bar/bob'],
    'Parse an object into namespaces'
  );

  assert.deepEqual(
    Addon.getNamespaces('foo'),
    [],
    'Invalid object should result in no namespaces'
  );

  assert.end();
});
