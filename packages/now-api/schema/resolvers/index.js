import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import { queries, resolvers, mutations } from './Event';

export default {
  Query: queries,
  Mutation: mutations,
  Event: resolvers,
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime,
};
