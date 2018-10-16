import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './typeDefs';
import resolvers from './resolvers';
import AdminDirective from './AdminDirective';
import logger from '../logger';

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
  logger: { log: message => logger.info(message) },
});
