# Slack RPG
[![Build Status](https://travis-ci.org/slack-rpg/slack-rpg.svg)](https://travis-ci.org/slack-rpg/slack-rpg) [![Coverage Status](https://coveralls.io/repos/slack-rpg/slack-rpg/badge.svg?branch=master&service=github)](https://coveralls.io/github/slack-rpg/slack-rpg?branch=master)

This slack bot will run an RPG inside your slack instance.

# TOC
<!-- TOC depthFrom:2 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Features](#features)
- [Locations](#locations)
	- [Location Types](#location-types)
- [Non-Player characters](#non-player-characters)
- [Monsters](#monsters)
- [Battles](#battles)
- [Add-Ons](#add-ons)
- [Interacting with Bot](#interacting-with-bot)
	- [Direct Message](#direct-message)
	- [Mention](#mention)
		- [Commands](#commands)
- [Install](#install)
- [Test](#test)
- [config.js](#configjs)
- [Docker](#docker)
	- [Configuration Environment Variables](#configuration-environment-variables)
- [Contributing](#contributing)

<!-- /TOC -->

## Features
- Each Channel the bot is invited to will become a new location in the game.
- Each Location can have non-playable characters (NPC) and/or monsters
- Players can join game and build a character
- Players can interact with Locations, NPCs and monsters
- Players can gain experience interacting with certain things and accomplishing quests
- Players can search for and find equip-able items
- Players can challenge other players to become rulers of a location

## Locations
When your GM is invited to a new channel, it will generate a new Location and link it to the channel. Locations will have any number of Points of Interest. When a location is first generated, it will have a NPC ruler of a certain class/level.  When a player reaches that level, they can challenge the NPC to a battle.  If they win they become the new ruler of the location. Other players can challenge  that player to become the new ruler.

### Location Types
Location can be of various types:
- **Tavern**: Usually contains NPCs and a quest board
- **Adventure**: An area of danger and intrigue
- **Shop**: An area to buy and sell items

## Non-Player characters
Non-Player Characters (NPCs) are characters controlled by the Dungeon Master. They could give out quests, rule locations, or just be regular hang about's. NPCs are usually friendly toward players unless provoked.

## Monsters
Monsters are NPCs that are hostile toward players. They can be defeated for experience during battles.

## Battles
## Add-Ons
Add-ons are packs of Monsters, Locations, Weapons, Names etc that can be included to enhance your game. See [slack-rpg/addon-official](https://github.com/slack-rpg/addon-official) for more details.

## Interacting with Bot
You can interact with the both through Direct Message or mentioning it in a channel.

### Direct Message
Direct messages are used to have a private conversation with the bot, such as creating a character.

### Mention
You can give the bot a command by mentioning it: `@bot roll 1d6`

#### Commands
The bot will respond to the following commands:
- _roll <dice>_: The bot will randomly roll the dice you specify and respond with the result.

## Install
1. Clone this [repository](https://github.com/shaunburdick/slack-rpg.git)
2. `npm install`
3. Copy `./config.default.js` to `./config.js` and [fill it out](#configjs)
4. `npm start`

## Test
1. `npm install` (make sure your NODE_ENV != `production`)
2. `npm test`

## config.js
The config file should be filled out as follows:
- app:
  - addons: string, a comma separated list of addons to load (defaults to 'slack-rpg/addon-official')
  - include:
    - general: boolean, Include the general channel as a location or not

- slack:
  - token: string, Your slack token
  - autoReconnect: boolean, Reconnect on disconnect

## Docker
Build an image using `docker build -t your_image:tag`

Official Image [slackrpg/slack-rpg](https://hub.docker.com/r/slackrpg/slack-rpg/)

### Configuration Environment Variables
You can set the configuration of the bot by using environment variables. _ENVIRONMENT_VARIABLE_=Default Value
- _APP_ADDONS_='slack-rpg/addon-official', a comma separated list of add-ons to load
- _APP_INCLUDE_GENERAL_=false, Include the general channel as a location
- _SLACK_TOKEN_=xoxb-foo, Your Slack Token
- _SLACK_AUTO_RECONNECT_=true, Reconnect on disconnect

Set them using the `-e` flag while running docker:

```
docker run -it \
-e SLACK_TOKEN=xobo-blarty-blar-blar \
slackrpg/slack-rpg:latest
```

## Contributing
1. Create a new branch, please don't work in master directly.
2. Add failing tests for the change you want to make (if appliciable). Run `npm test` to see the tests fail.
3. Fix stuff.
4. Run `npm test` to see if the tests pass. Repeat steps 2-4 until done.
5. Check code coverage `npm run coverage` and add test paths as needed.
6. Update the documentation to reflect any changes.
7. Push to your fork and submit a pull request.
