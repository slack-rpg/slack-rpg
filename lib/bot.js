'use strict';

const Botkit = require('botkit');
const logger = require('./logger')();

const GameMaster = require('./gamemaster');

/**
 * @module Bot
 */
class Bot {
  /**
   * Constructor.
   *
   * @constructor
   * @param {object} config The final configuration for the bot
   * @param {object} addons The addon information for the bot
   */
  constructor(config, addons) {
    this.config = config;
    this.controller = Botkit.slackbot();

    this.lookup = new Map();
    this.payload = {};

    this.gm = null;
    this.addons = addons;
  }

  /**
   * Function to be called on slack open
   *
   * @param {object} payload Connection payload
   * @return {Bot} returns itself
   */
  slackOpen(payload) {
    const channels = [];
    const groups = [];
    const mpims = [];

    logger.info(`Welcome to Slack. You are @${payload.self.name} of ${payload.team.name}`);

    /* istanbul ignore else */
    if (payload.channels) {
      payload.channels.forEach((channel) => {
        /* istanbul ignore else */
        if (channel.is_member) {
          channels.push(`#${channel.name}`);
        }
      });

      logger.info(`You are in: ${channels.join(', ')}`);
    }

    /* istanbul ignore else */
    if (payload.groups) {
      payload.groups.forEach((group) => {
        groups.push(`${group.name}`);
      });

      logger.info(`Groups: ${groups.join(', ')}`);
    }

    /* istanbul ignore else */
    if (payload.mpims) {
      payload.mpims.forEach((mpim) => {
        mpims.push(`${mpim.name}`);
      });

      logger.info(`Multi-person IMs: ${mpims.join(', ')}`);
    }

    return this;
  }

  /**
   * Handle an incoming message
   * @param {object} message The incoming message from Slack
   * @returns {null} nada
   */
  handleDirectMessage(message) {
    if (message.type === 'message' && message.text) {
      // Handle Message Here
      this.gm.command(message.user, message.text).then((responses) => {
        responses.forEach((response) => {
          this.bot.reply(message, response.message);
        });
      }, (error) => {
        logger.error('Error responding to message', message, error);
      });
    } else {
      logger.info(`@${this.bot.identity.name} could not respond.`);
    }
  }

  /**
   * Populates a quick lookup table.
   *
   * @param {object} payload The rtm.start payload
   * @return {Bot} returns itself
   */
  populateLookup(payload) {
    ['users', 'channels', 'groups', 'mpims'].forEach((type) => {
      if (payload[type]) {
        payload[type].forEach((item) => {
          this.lookup.set(item.id, item);
        });
      }
    });
  }

  /**
   * Start a new instance of the GameMaster for the team
   *
   * @param {object} payload The rtm.start payload
   * @return {Bot} returns itself
   */
  startGameMaster(payload) {
    this.gm = new GameMaster(payload.team.id);
    this.gm.loadAddons(this.config.app.addons).then(() => {
      logger.info('Loaded addons:', this.gm.getAddonNamespaces());
    }, (error) => {
      logger.error('Error loading addons', error);
    });
  }

  /**
   * Start the bot
   *
   * @return {Bot} returns itself
   */
  start() {
    this.controller.on('team_join,user_change,bot_group_join,bot_channel_join', (bot, message) => {
      if (message.user && message.user.id) {
        logger.info(`Saw new user: ${message.user.name}`);
        this.lookup.set(message.user.id, message.user);
      } else if (message.channel && message.channel.id) {
        logger.info(`Saw new channel: ${message.channel.name}`);
        this.lookup.set(message.channel.id, message.channel);
      }
    });

    this.controller.on(
      'direct_mention,mention',
      (bot, message) => {
        this.handleDirectMessage(message);
      }
    );

    this.controller.on('rtm_close', () => {
      logger.info('The RTM api just closed');

      if (this.config.slack.autoReconnect) {
        this.connect();
      }
    });

    this.connect();

    return this;
  }

  /**
   * Connect to the RTM
   * @return {Bot} this
   */
  connect() {
    this.bot = this.controller.spawn({
      token: this.config.slack.token,
      no_unreads: true,
      mpim_aware: true,
    }).startRTM((err, bot, payload) => {
      if (err) {
        logger.error('Error starting bot!', err);
      }

      this.payload = payload;
      this.populateLookup(payload);
      this.slackOpen(payload);
      this.startGameMaster(payload);
    });

    return this;
  }
}

module.exports = Bot;
