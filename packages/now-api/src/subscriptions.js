import { PubSub } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { memoize } from 'lodash';
import { isDev } from './util';

const memory = () => new PubSub();
const redis = () =>
  new RedisPubSub({
    publisher: new Redis({
      host: process.env.REDIS_PUBLISHER,
      port: 6379,
      retry_strategy: ({ attempt }) =>
        // reconnect after
        Math.max(attempt * 100, 3000),
    }),
    subscriber: new Redis({
      host: process.env.REDIS_SUBSCRIBER,
      port: 6379,
      retry_strategy: ({ attempt }) =>
        // reconnect after
        Math.max(attempt * 100, 3000),
    }),
  });

export const getMemoryPubSub = memoize(memory);
export const getRedisPubSub = memoize(redis);
export const getPubSub = isDev() ? getMemoryPubSub : getRedisPubSub;
