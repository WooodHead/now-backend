import 'js-joda-timezone';

import schema from './schema';

const { ApolloServer } = require('apollo-server-lambda');

const server = new ApolloServer({ schema });

exports.handler = server.createHandler({
  cors: {
    origin: true,
    credentials: true,
  },
});
