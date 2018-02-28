import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import * as BotEvent from './BotEvent';
import * as Event from './Event';
import * as User from './User';
import * as ActivityTemplate from './ActivityTemplate';

export default {
  Query: {
    ...BotEvent.queries,
    ...User.queries,
    ...ActivityTemplate.queries,
    ...Event.queries,
  },
  Mutation: {
    ...BotEvent.mutations,
    ...ActivityTemplate.mutations,
    ...Event.mutations,
  },
  BotEvent: BotEvent.resolvers,
  Event: Event.resolvers,
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime,
};
