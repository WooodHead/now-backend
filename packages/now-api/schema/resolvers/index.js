import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import * as BotEvent from './BotEvent';
import * as Event from './Event';
import * as User from './User';
import * as ActivityTemplate from './ActivityTemplate';
import * as Message from './Message';

export default {
  Query: {
    ...BotEvent.queries,
    ...User.queries,
    ...ActivityTemplate.queries,
    ...Event.queries,
    ...Message.queries,
  },
  Mutation: {
    ...BotEvent.mutations,
    ...ActivityTemplate.mutations,
    ...Event.mutations,
    ...Message.mutations,
  },
  BotEvent: BotEvent.resolvers,
  Event: Event.resolvers,
  Message: Message.resolvers,
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime,
};
