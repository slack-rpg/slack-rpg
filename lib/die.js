'use strict';

const MAX_DICE = 100;
const MAX_SIDES = 100;
const MAX_MODIFIER = 100;

/**
 * Rolls a number of dice and adds any modifiers.
 *
 * @param {integer} num      The number of dice to roll
 * @param {integer} sides    The number of side for the dice
 * @param {integer} modifier Any additional modifer to add
 * @return {object} { total: integer, pure: integer, dice: integer[] }
 * @throws Error if num or sides is invalid
 */
function roll(num, sides, modifier) {
  const retVal = {
    total: 0,
    pure: 0,
    dice: [],
    toString() {
      const strModifier = modifier ? (modifier > 0 ? '+' : '') + modifier : '';
      return `${num}d${sides}${strModifier}: ${this.total} (Pure: ${this.pure} [${this.dice.join(', ')}])`;
    },
  };

  if (!num || num < 1) {
    throw new Error('Number of dice must be > 0');
  }

  if (num > MAX_DICE) {
    throw new Error(`I will not roll more than ${MAX_DICE} dice!`);
  }

  if (!sides || sides < 2) {
    throw new Error('Number of sides must be > 1');
  }

  if (sides > MAX_SIDES) {
    throw new Error(`I will not roll more than ${MAX_SIDES} sides!`);
  }

  if (modifier > MAX_MODIFIER || modifier < MAX_MODIFIER * -1) {
    throw new Error(`I will not add a modifier of more than +/-${MAX_SIDES}!`);
  }

  for (let x = 0; x < num; x++) {
    const toss = Math.floor(Math.random() * sides) + 1;
    retVal.pure += toss;
    retVal.dice.push(toss);
  }

  retVal.total = retVal.pure + (modifier || 0);

  return retVal;
}

module.exports = {
  roll,
  MAX_DICE,
  MAX_SIDES,
  MAX_MODIFIER,
};
