FROM node:latest

MAINTAINER Shaun Burdick <docker@shaunburdick.com>

ENV NODE_ENV=production \
    APP_ADDONS=slack-rpg/addon-official \
    APP_INCLUDE_GENERAL=false \
    SLACK_TOKEN=xoxb-foo \
    SLACK_AUTO_RECONNECT=true

ADD . /usr/src/myapp

WORKDIR /usr/src/myapp

RUN ["npm", "install"]

CMD ["npm", "start"]
