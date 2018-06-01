import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './typeDefs.graphql';
import resolvers from './resolvers';
import AdminDirective from './AdminDirective';

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    admin: AdminDirective,
  },
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
});
