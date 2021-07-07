FROM node:14.17.3-alpine

RUN apk add --no-cache git

WORKDIR /app

COPY package.json yarn.lock /app/

RUN yarn --frozen-lockfile

COPY scripts /app/scripts
COPY src /app/src

USER node

ENTRYPOINT ["yarn", "cache:update"]
