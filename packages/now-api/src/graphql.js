import { ApolloServer } from 'apollo-server-express';
import { ApolloEngine } from 'apollo-engine';
import { get } from 'lodash';
import { createServer } from 'http';
import jwt from 'express-jwt';
import 'js-joda-timezone';
import jwksRsa from 'jwks-rsa';
import { resolveGraphiQLString } from 'apollo-server-module-graphiql';
import url from 'url';

import typeDefs from './schema/typeDefs';
import resolvers from './schema/resolvers';
import AdminDirective from './schema/AdminDirective';
import buildUserForContext from './buildContext';
import { endpoint as auth0Endpoint } from './auth0';

const isDev = process.env.NODE_ENV === 'development';

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${auth0Endpoint}/.well-known/jwks.json`,
  }),
  credentialsRequired: true,
  audience: 'https://now.meetup.com/graphql',
  issuer: `${auth0Endpoint}/`,
  algorithms: ['RS256'],
});

const graphiqlExpress = options => {
  const graphiqlHandler = (req, res, next) => {
    const query = req.url && url.parse(req.url, true).query;
    resolveGraphiQLString(query, options, req).then(
      graphiqlString => {
        res.setHeader('Content-Type', 'text/html');
        res.write(graphiqlString);
        res.end();
      },
      error => next(error)
    );
  };

  return graphiqlHandler;
};

export default app => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    schemaDirectives: {
      admin: AdminDirective,
    },
    context: ({ req, res, connection = {} }) => {
      if (!req) {
        return connection.context;
      }
      return new Promise((resolve, reject) => {
        checkJwt(req, res, err => {
          if (err) {
            res.send(401);
            reject(new Error('error authorizing http'));
          } else {
            resolve(buildUserForContext(req, { http: true }));
          }
        });
      });
    },
    debug: isDev,
    tracing: true,
    cacheControl: true,
    introspection: true,
    logFunction: isDev || process.env.VERBOSE ? console.log : () => {},
    // formatError: e => ({ message: e.message }),
    subscriptions: {
      onConnect: ({ token }) =>
        new Promise((resolve, reject) => {
          const req = {
            headers: { authorization: `Bearer ${token}` },
            get: () => {},
          };
          checkJwt(req, null, err => {
            if (err) {
              reject(new Error('error authorizing websocket'));
            } else {
              resolve(buildUserForContext(req, { websocket: true }));
            }
          });
        }),
      path: '/subscriptions',
    },
    playground: false,
  });

  app.get(
    '/graphiql',
    graphiqlExpress(req => {
      const token = get(req, ['query', 'token']);
      return {
        endpointURL: '/graphql',
        passHeader: `'Authorization': 'Bearer ${token}'`,
        subscriptionsEndpoint: url.format({
          host: req.get('host'),
          protocol: req.protocol === 'https' ? 'wss' : 'ws',
          pathname: '/subscriptions',
        }),
        websocketConnectionParams: {
          token,
        },
      };
    })
  );

  server.applyMiddleware({ app });
  const httpServer = createServer(app);
  server.installSubscriptionHandlers(httpServer);
  const PORT = 3000;

  if (process.env.ENGINE_KEY) {
    const engine = new ApolloEngine({
      apiKey: process.env.ENGINE_KEY,
    });

    engine.listen({
      port: PORT,
      httpServer,
    });
  } else {
    httpServer.listen(PORT, () => {
      console.log(
        `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
      );
      console.log(
        `🚀 Subscriptions ready at ws://localhost:${PORT}${
          server.subscriptionsPath
        }`
      );
    });
  }
};
