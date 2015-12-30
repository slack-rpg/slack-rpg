'use strict';

const logger = require('./logger')();
const Die = require('./die');

const DICE_REGEX = /^(\d+)d(\d+)([\+\-]\d+)?$/;

/**
 * @module GameMaster
 */

class GameMaster {
  /**
   * @constructor
   * @param {string} teamId the id of the team this game master is for
   */
  constructor(teamId) {
    this.teamId = teamId;
  }

  /**
   * Roll some dice.
   *
   * @param {string} playerId The player to roll for
   * @param {string} dice     What dice to roll (xdx+x format)
   * @return {object} dice roll @see Die.roll()
   * @throws Error if playerId is empty or die roll is invalid
   */
  roll(playerId, dice) {
    if (!playerId) {
      throw new Error(`Invalid playerId: ${playerId}`);
    }

    const parsedDice = this.parseDice(dice);
    const rollRes = Die.roll(parsedDice.num, parsedDice.sides, parsedDice.modifer);

    logger.debug(`Rolled ${dice} for ${playerId}`, rollRes);

    return rollRes;
  }

  /**
   * Parse a dice command (1d4+3) into pieces.
   *
   * @param {string} dice The dice command
   * @return {object} { num: integer, sides: integer, modifier: integer }
   * @throws Error if it cannot parse into valid command
   */
  parseDice(dice) {
    const retVal = {
      num: 0,
      sides: 0,
      modifier: 0,
    };

    if (typeof dice === 'string') {
      const matched = dice.match(DICE_REGEX);
      if (matched && matched.length > 2) {
        retVal.num = parseInt(matched[1], 10);
        retVal.sides = parseInt(matched[2], 10);
        if (matched.length === 4 && matched[3]) {
          retVal.modifier = parseInt(matched[3], 10);
        }
      } else {
        throw new Error(`Invalid Dice Command: ${dice}`);
      }
    } else {
      throw new Error('Empty or Non-String Dice Command');
    }

    return retVal;
  }
}

module.exports = GameMaster;
