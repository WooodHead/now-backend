import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './typeDefs';
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
  inheritResolversFromInterfaces: true,
});
