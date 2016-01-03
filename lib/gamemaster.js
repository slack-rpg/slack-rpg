'use strict';

const logger = require('./logger')();
const Die = require('./die');
const Addon = require('./addon');

const DICE_REGEX = /^(\d+)d(\d+)([\+\-]\d+)?$/;

const COMMANDS = {
  roll: 'roll',
};

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
    this.addons = {};

    this.commands = COMMANDS;
  }

  /**
   * Load addons.
   *
   * @param {string} addons A list of addons, comma separated
   * @return {Promise} resolves when the addons are loaded
   */
  loadAddons(addons) {
    return new Promise((resolve, reject) => {
      Addon.fetch(addons).then((fetch) => {
        this.addons = fetch;
        resolve(this.addons);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * Get addon namespaces.
   *
   * @return {string[]} A list of addon namespaces loaded.
   */
  getAddonNamespaces() {
    return Addon.getNamespaces(this.addons);
  }

  /**
   * Parse a message for command(s).
   *
   * @param {string} playerId Id of the player who messaged
   * @param {string} message  A message to look for commands
   * @return {Promise} resolves with object[] of messages
   */
  command(playerId, message) {
    const retVal = [];
    return new Promise((resolve, reject) => {
      const commands = this.parseCommands(message);
      if (commands.length) {
        commands.forEach((command) => {
          switch (command.command) {
            case this.commands.roll:
              retVal.push({
                message: this.roll(command.args[0]).toString(),
                private: false,
              });
              break;
            /* istanbul ignore next: I can't think of a way to get here but if it happens I should handle it */
            default:
              reject(new Error(`Unexpected command: ${command.command}`));
          }
        });

        resolve(retVal);
      } else {
        reject(new Error(`No commands found: ${message}`));
      }
    });
  }

  /**
   * Parse command(s) from a message.
   *
   * @param {string} message A message to look for commands
   * @return {object[]} And array of commands and args
   */
  parseCommands(message) {
    const retVal = [];

    if (message && message.length) {
      // Roll
      const rollMatch = message.match(/\broll\b.*(\d+d\d+(?:[\+\-]\d+)?)/i);
      if (rollMatch && rollMatch.length === 2) {
        retVal.push({
          command: this.commands.roll,
          args: rollMatch.splice(1),
        });
      }
    }

    return retVal;
  }

  /**
   * Roll some dice.
   *
   * @param {string} dice     What dice to roll (xdx+x format)
   * @return {object} dice roll @see Die.roll()
   */
  roll(dice) {
    const parsedDice = this.parseDice(dice);
    const rollRes = Die.roll(parsedDice.num, parsedDice.sides, parsedDice.modifier);

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
