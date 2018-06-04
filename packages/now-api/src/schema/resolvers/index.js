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
import * as Location from './Location';
import * as Invitation from './Invitation';
import { LocalDate, ZonedDateTime } from './joda';
import Name from './Name';
import Birthdate from './Birthdate';
import { wrapResolvers } from '../authorization';

export default wrapResolvers({
  Query: {
    ...User.queries,
    ...Activity.queries,
    ...Event.queries,
    ...Message.queries,
    ...Location.queries,
    ...Invitation.queries,
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
    ...Invitation.mutations,
  },
  Activity: Activity.resolvers,
  Device: Device.resolvers,
  Event: Event.resolvers,
  Message: Message.resolvers,
  Rsvp: Rsvp.resolvers,
  User: User.resolvers,
  Invitation: Invitation.resolvers,
  EventMessagesEdge: {
    node: root => ({
      ...root.node,
    }),
  },
  LocalDate,
  ZonedDateTime,
  GraphQLJSON,
  Upload: GraphQLUpload,
  Name,
  Birthdate,
});
