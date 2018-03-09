import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import * as BotEvent from './BotEvent';
import * as Event from './Event';
import * as User from './User';
import * as ActivityTemplate from './ActivityTemplate';
import * as Message from './Message';
import * as Rsvp from './Rsvp';

export default {
  Query: {
    ...BotEvent.queries,
    ...User.queries,
    ...ActivityTemplate.queries,
    ...Event.queries,
    ...Message.queries,
  },
  Subscription: {
    ...Message.subscriptions,
  },
  Mutation: {
    ...BotEvent.mutations,
    ...ActivityTemplate.mutations,
    ...Event.mutations,
    ...Message.mutations,
    ...Rsvp.mutations,
  },
  BotEvent: BotEvent.resolvers,
  Event: Event.resolvers,
  Message: Message.resolvers,
  Rsvp: Rsvp.resolvers,
  EventMessagesEdge: {
    node: root => ({
      ...root.node,
    }),
  },
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime,
};
