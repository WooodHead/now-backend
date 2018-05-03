import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import { GraphQLUpload } from 'apollo-upload-server';
import GraphQLJSON from 'graphql-type-json';
import * as Device from './Device';
import * as Event from './Event';
import * as User from './User';
import * as Activity from './Activity';
import * as Message from './Message';
import * as Rsvp from './Rsvp';
import * as Photo from './Photo';
import * as Report from './Report';
import Name from './Name';
import Birthdate from './Birthdate';
import { wrapResolvers } from '../authorization';

export default wrapResolvers({
  Query: {
    ...User.queries,
    ...Activity.queries,
    ...Event.queries,
    ...Message.queries,
  },
  Subscription: {
    ...Event.subscriptions,
    ...Message.subscriptions,
  },
  Mutation: {
    ...Activity.mutations,
    ...Device.mutations,
    ...Event.mutations,
    ...Message.mutations,
    ...Rsvp.mutations,
    ...Photo.mutations,
    ...User.mutations,
    ...Report.mutations,
  },
  Activity: Activity.resolvers,
  Device: Device.resolvers,
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
  GraphQLJSON,
  Upload: GraphQLUpload,
  Name,
  Birthdate,
});
