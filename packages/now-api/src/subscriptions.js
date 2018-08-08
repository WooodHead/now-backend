/* eslint-disable import/prefer-default-export */
import { PostgresPubSub } from 'graphql-postgres-subscriptions';
import { PubSub } from 'apollo-server-express';
import { memoize } from 'lodash';

import { connection } from './db/sql';

const memory = memoize(() => new PubSub());
const pg = memoize(() => new PostgresPubSub(connection));

export const getPubSub = process.env.NODE_ENV === 'test' ? memory : pg;
