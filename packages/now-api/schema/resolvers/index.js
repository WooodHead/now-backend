import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import * as BotEvent from './BotEvent';
import * as User from './User';
import * as ActivityTemplate from './ActivityTemplate';

export default {
  Query: { ...BotEvent.queries, ...User.queries, ...ActivityTemplate.queries },
  Mutation: { ...BotEvent.mutations, ...ActivityTemplate.mutations },
  BotEvent: BotEvent.resolvers,
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime,
};
