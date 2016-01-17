'use strict';

// const logger = require('./logger')();
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

    this.seeds = {
      classes: { data: {} },
      locations: { data: {
        names: {
          pre: [],
          name: [],
          sur: [],
        },
        descriptions: [],
        adjectives: [],
      } },
      monsters: { data: {} },
      names: { data: {
        pre: [],
        name: [],
        sur: [],
      } },
      races: { data: {} },
      weapons: { data: {
        types: {},
        weapons: {},
      } },
    };

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
        this.seedAddons();
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * Seed the addons for lookup and randon selection.
   * @return {GameMaster} self
   * @throws Error if finds an unknown type
   */
  seedAddons() {
    for (const user in this.addons) {
      for (const repo in this.addons[user]) {
        for (const name in this.addons[user][repo]) {
          const namespace = `${user}/${repo}/${name}`;
          for (const type in this.addons[user][repo][name]) {
            const addonData = this.addons[user][repo][name][type].data;
            switch (type) {
              case 'locations':
                /* istanbul ignore else: validation was done beforehand */
                if (addonData.names) {
                  ['pre', 'name', 'sur'].forEach((section) => {
                    this.seeds.locations.data.names[section] =
                      this.seeds.locations.data.names[section].concat(addonData.names[section]);
                  });
                }

                /* istanbul ignore else: validation was done beforehand */
                if (addonData.descriptions) {
                  this.seeds.locations.data.descriptions =
                    this.seeds.locations.data.descriptions.concat(addonData.descriptions);
                }

                /* istanbul ignore else: validation was done beforehand */
                if (addonData.adjectives) {
                  this.seeds.locations.data.adjectives =
                    this.seeds.locations.data.adjectives.concat(addonData.adjectives);
                }
                break;
              case 'monsters':
                /* istanbul ignore else: validation was done beforehand */
                if (Array.isArray(addonData.monsters)) {
                  for (const monster of addonData.monsters) {
                    // Add the namespace to the id to prevent duplicates
                    monster.id = `${namespace}/${monster.id}`;
                    this.seeds.monsters.data[monster.id] = monster;
                  }
                }
                break;
              case 'names':
                ['pre', 'name', 'sur'].forEach((section) => {
                  this.seeds.names.data[section] =
                    this.seeds.names.data[section].concat(addonData[section]);
                });
                break;
              case 'weapons':
                /* istanbul ignore else: validation was done beforehand */
                if (addonData.types) {
                  for (const wepType of addonData.types) {
                    wepType.id = `${namespace}/${wepType.id}`;
                    this.seeds.weapons.data.types[wepType.id] = wepType;
                  }
                }

                /* istanbul ignore else: validation was done beforehand */
                if (addonData.weapons) {
                  for (const weapon of addonData.weapons) {
                    weapon.id = `${namespace}/${weapon.id}`;
                    weapon.type = `${namespace}/${weapon.type}`;
                    this.seeds.weapons.data.weapons[weapon.id] = weapon;
                  }
                }
                break;
              case 'classes':
                /* istanbul ignore else: validation was done beforehand */
                if (Array.isArray(addonData.classes)) {
                  for (const playerClass of addonData.classes) {
                    // Add the namespace to the id to prevent duplicates
                    playerClass.id = `${namespace}/${playerClass.id}`;
                    this.seeds.classes.data[playerClass.id] = playerClass;
                  }
                }
                break;
              case 'races':
                /* istanbul ignore else: validation was done beforehand */
                if (Array.isArray(addonData.races)) {
                  for (const race of addonData.races) {
                    // Add the namespace to the id to prevent duplicates
                    race.id = `${namespace}/${race.id}`;
                    this.seeds.races.data[race.id] = race;
                  }
                }
                break;
              /* istanbul ignore next: validation was done beforehand */
              default:
                throw new Error(`Unexpected type: ${type} in ${namespace}`);
            }
          }
        }
      }
    }
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
            /* istanbul ignore next: I can't think of a way to get here */
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

  /**
   * Generate a random player name.
   *
   * @param {object} pieces An object of pre, name, sur options
   * @return {string} A player name
   */
  generateName(pieces) {
    let retVal = '';

    // Pre
    retVal += pieces.pre[
      Math.floor(Math.random() * pieces.pre.length)
    ].toLowerCase();

    // Name
    retVal += pieces.name[
      Math.floor(Math.random() * pieces.name.length)
    ].toLowerCase();

    // Sur
    retVal += pieces.sur[
      Math.floor(Math.random() * pieces.sur.length)
    ].toLowerCase();

    return retVal.charAt(0).toUpperCase() + retVal.substr(1);
  }
}

module.exports = GameMaster;
