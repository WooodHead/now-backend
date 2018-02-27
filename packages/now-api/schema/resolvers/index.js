import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import * as BotEvent from './BotEvent';
import * as User from './User';

export default {
  Query: { ...BotEvent.queries, ...User.queries },
  Mutation: BotEvent.mutations,
  BotEvent: BotEvent.resolvers,
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime,
};
