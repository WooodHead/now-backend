import 'js-joda-timezone';
import { ApolloServer } from 'apollo-server-lambda';

import { checkMeetupAuthLambda } from './classicApiAuth';
import schema from './schema';

const server = new ApolloServer({
  introspection: true,
  // logFunction: console.log,
  schema,
  context: ({ event }) => checkMeetupAuthLambda(event.headers),
});

exports.handler = server.createHandler({
  cors: {
    origin: true,
    credentials: true,
  },
});
