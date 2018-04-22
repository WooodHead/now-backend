import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './typeDefs.graphql';
import resolvers from './resolvers';

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
});
