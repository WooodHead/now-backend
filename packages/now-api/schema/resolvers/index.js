import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import * as Event from './Event';
import * as User from './User';

export default {
  Query: { ...Event.queries, ...User.queries },
  Mutation: Event.mutations,
  Event: Event.resolvers,
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime,
};
