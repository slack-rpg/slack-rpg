'use strict';

const request = require('request');
const Validator = require('slack-rpg-addon-validator');
const Zip = require('adm-zip');

const GITHUB_REGEX = /^[\w\-]+\/[\w\-]+$/;
const IGNORE_FOLDERS = ['node_modules', '.git'];

/**
 * Fetch an addon from GitHub.
 *
 * @param {string} repo The repo in user/repo format
 * @returns {Promise} Resolved with a buffer containing a zip of the repo
 */
function fetchGitHub(repo) {
  return new Promise((resolve, reject) => {
    if (!GITHUB_REGEX.test(repo)) {
      reject(new Error(`Repo in unknown format (user/repo): ${repo}`));
    }

    const requestOpts = {
      method: 'GET',
      url: `https://github.com/${repo}/archive/master.zip`,
      encoding: null, // force buffer
    };

    request(requestOpts, (error, res, body) => {
      if (error) {
        reject(new Error(error.message));
      }

      if (res.statusCode !== 200) {
        reject(new Error(`GitHub responded with: ${res.statusCode}`));
      }

      resolve(body);
    });
  });
}

/**
 * Extracts addons from zip
 *
 * @param {Buffer} zip       The zip file
 * @param {string} namespace The base namespace for any found addons
 * @return {Promise} Resolved with extracted addons fully namespaced
 */
function extract(zip, namespace) {
  return new Promise((resolve, reject) => {
    let admzip;
    if (!namespace) {
      reject(new Error('No namespace given'));
    }

    const splitNS = namespace.split('/');
    if (!splitNS || splitNS.length !== 2) {
      reject(new Error(`Invalid or unrecognized namespace: ${namespace}`));
    }

    const retVal = {};
    retVal[splitNS[0]] = {};
    retVal[splitNS[0]][splitNS[1]] = {};

    try {
      admzip = new Zip(zip);
    } catch (err) {
      reject(new Error(`Zip Error: ${err}`));
    }

    admzip.getEntries().forEach((entry) => {
      const splitEntry = entry.entryName.split('/');
      if (
        !entry.isDirectory // File
        && IGNORE_FOLDERS.indexOf(splitEntry[1]) === -1 // Not in an ignored folder
        && splitEntry.length === 3 // Or in a sub folder
      ) {
        if (!retVal[splitNS[0]][splitNS[1]].hasOwnProperty(splitEntry[1])) {
          retVal[splitNS[0]][splitNS[1]][splitEntry[1]] = {};
        }

        try {
          if (Validator.check(entry.getData().toString())) {
            const jsonAddon = JSON.parse(entry.getData().toString());
            if (!retVal[splitNS[0]][splitNS[1]][splitEntry[1]].hasOwnProperty(jsonAddon.type)) {
              retVal[splitNS[0]][splitNS[1]][splitEntry[1]][jsonAddon.type] = jsonAddon;
            } else {
              reject(new Error(`${splitNS[0]}/${splitNS[1]}/${splitEntry[1]} has more than one ${jsonAddon.type}`));
            }
          }
        } catch (err) {
          reject(new Error(`Validation Error: ${entry.entryName} - ${err.message}`));
        }
      }
    });

    resolve(retVal);
  });
}

/**
 * Parse Addons from a string.
 *
 * @param {string} addons A string of addons, comma separated
 * @return {string[]} An array of individual addons
 * @throws Error is it cannot parse an addon
 */
function parse(addons) {
  const retVal = [];

  if (addons.length) {
    const split = addons.split(/\,\s*/);
    split.forEach((addon) => {
      if (GITHUB_REGEX.test(addon)) {
        retVal.push(addon);
      } else {
        throw new Error(`Invalid Addon Name: ${addon}`);
      }
    });
  }

  return retVal;
}

/**
 * Fetch addons.
 *
 * @param {string} addons A list of addons, comma separated
 * @return {Promise} resolves with an object of all addons
 */
function fetch(addons) {
  return new Promise((resolve, reject) => {
    const retVal = {};
    let arrAddons;
    try {
      arrAddons = parse(addons);
    } catch (error) {
      reject(error);
    }

    const proms = [];
    arrAddons.forEach((addon) => {
      proms.push(new Promise((res) => {
        fetchGitHub(addon).then((zip) => {
          extract(zip, addon).then((foundAddon) => {
            for (const attr in foundAddon) {
              if (foundAddon.hasOwnProperty(attr)) {
                retVal[attr] = foundAddon[attr];
                res();
              }
            }
          }, (error) => {
            reject(error);
          });
        }, (error) => {
          reject(error);
        });
      }));
    });

    Promise.all(proms).then(() => {
      resolve(retVal);
    });
  });
}

module.exports = {
  fetchGitHub,
  extract,
  parse,
  fetch,
};
