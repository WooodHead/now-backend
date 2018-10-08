import { LocalDate, ZonedDateTime, ZoneId } from 'graphql-joda-types';
import { GraphQLUpload } from 'apollo-upload-server';
import GraphQLJSON from 'graphql-type-json';

import * as Category from './Category';
import * as Device from './Device';
import * as Event from './Event';
import * as EventMessagesConnection from './EventMessagesConnection';
import * as User from './User';
import * as Activity from './Activity';
import * as Message from './Message';
import * as Rsvp from './Rsvp';
import * as Photo from './Photo';
import * as Report from './Report';
import * as Location from './Location';
import * as Invitation from './Invitation';
import * as Jobs from './Jobs';
import * as ServerMessages from './ServerMessages';
import * as Template from './Template';
import * as Community from './Community';
import Name from './Name';
import { wrapResolvers } from '../authorization';

export default wrapResolvers({
  Query: {
    ...User.queries,
    ...Activity.queries,
    ...Event.queries,
    ...EventMessagesConnection.queries,
    ...Message.queries,
    ...Location.queries,
    ...Invitation.queries,
    ...ServerMessages.queries,
    ...Template.queries,
    ...Category.queries,
    ...Community.queries,
    userAgent: (root, args, { userAgent }) => userAgent,
  },
  Subscription: {
    ...Event.subscriptions,
    ...Message.subscriptions,
  },
  Mutation: {
    ...Activity.mutations,
    ...Device.mutations,
    ...Event.mutations,
    ...Location.mutations,
    ...Message.mutations,
    ...Rsvp.mutations,
    ...Photo.mutations,
    ...User.mutations,
    ...Report.mutations,
    ...Invitation.mutations,
    ...Jobs.mutations,
    ...ServerMessages.mutations,
    ...Community.mutations,
  },
  Activity: Activity.resolvers,
  Category: Category.resolvers,
  Device: Device.resolvers,
  Event: Event.resolvers,
  Message: Message.resolvers,
  Rsvp: Rsvp.resolvers,
  User: User.resolvers,
  Invitation: Invitation.resolvers,
  EventMessagesConnection: EventMessagesConnection.resolvers,
  Location: Location.resolvers,
  Community: Community.resolvers,
  EventMessagesEdge: {
    node: root => ({
      ...root.node,
    }),
  },
  LocalDate,
  ZonedDateTime,
  ZoneId,
  GraphQLJSON,
  Upload: GraphQLUpload,
  Name,
});
