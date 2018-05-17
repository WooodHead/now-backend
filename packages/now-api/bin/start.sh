#!/bin/sh

echo migrating {$NODE_ENV}
node ./node_modules/knex/bin/cli.js migrate:latest --env $NODE_ENV
date -u +" starting server at %Y-%m-%dT%H:%M:%SZ"
node server.js
