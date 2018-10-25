#!/bin/sh

set -ex

export EC2_INSTANCE_ID=`curl http://169.254.169.254/latest/meta-data/instance-id`
echo migrating {$NODE_ENV}
node ./node_modules/knex/bin/cli.js migrate:latest --env $NODE_ENV
date -u +" starting server at %Y-%m-%dT%H:%M:%SZ"
node dist/index.js
