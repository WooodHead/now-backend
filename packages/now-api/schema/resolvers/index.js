import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import * as Event from './Event';
import * as User from './User';
import * as Activity from './Activity';
import * as Message from './Message';
import * as Rsvp from './Rsvp';

export default {
  Query: {
    ...User.queries,
    ...Activity.queries,
    ...Event.queries,
    ...Message.queries,
  },
  Subscription: {
    ...Message.subscriptions,
  },
  Activity: Activity.resolvers,
  Mutation: {
    ...Activity.mutations,
    ...Event.mutations,
    ...Message.mutations,
    ...Rsvp.mutations,
  },
  Event: Event.resolvers,
  Message: Message.resolvers,
  Rsvp: Rsvp.resolvers,
  User: User.resolvers,
  EventMessagesEdge: {
    node: root => ({
      ...root.node,
    }),
  },
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime,
};
