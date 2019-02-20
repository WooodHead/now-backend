import { ApolloServer } from 'apollo-server-express';
import { ApolloEngine } from 'apollo-engine';
import { get } from 'lodash';
import { createServer } from 'http';
import { createServer as createSecureServer } from 'https';
import os from 'os';
import fs from 'fs';
import path from 'path';
import 'js-joda-timezone';
import { resolveGraphiQLString } from 'apollo-server-module-graphiql';
import url from 'url';
import cookieParser from 'cookie-parser';

import { checkMeetupAuthExpress } from './classicApiAuth';
import logger from './logger';
import schema from './schema';

const isDev = process.env.NODE_ENV === 'development';

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
    schema,
    context: ({ req, res, connection = {} }) => {
      if (!req) {
        return connection.context;
      }
      return checkMeetupAuthExpress(req, res);
    },
    debug: isDev,
    tracing: true,
    cacheControl: true,
    introspection: true,
    logFunction: logger.verbose,
    formatError: error => {
      logger.error(error);

      const startsWith = (message, matches) => {
        for (let i = 0; i < matches.length; i += 1) {
          if (message.startsWith(matches[i])) {
            return true;
          }
        }
        return false;
      };
      if (error.message) {
        if (startsWith(error.message, ['select', 'update', 'insert'])) {
          return { ...error, message: 'Internal Server Error' };
        }
      }
      return error;
    },
    subscriptions: {
      onConnect: (params, ws, { request }) => {
        cookieParser()(request, {}, () => {});

        request.get = option => {
          if (option === 'host') {
            return 'now.meetup.com';
          }
          return '';
        };

        return checkMeetupAuthExpress(request);
      },
      path: '/subscriptions',
    },
    playground: false,
  });

  if (isDev) {
    app.get(
      '/graphiql',
      graphiqlExpress(req => {
        const token = get(req, ['query', 'token']);
        return {
          endpointURL: '/graphql',
          passHeader: `'Authorization': 'Bearer ${token}'`,
          subscriptionsEndpoint: url.format({
            host: `//${req.get('host')}`,
            protocol: req.protocol === 'https' ? 'wss' : 'ws',
            pathname: '/subscriptions',
          }),
          websocketConnectionParams: {
            token,
          },
        };
      })
    );
  }

  server.applyMiddleware({ app });

  let httpServer;

  if (isDev) {
    const httpKey = path.resolve(
      os.homedir(),
      '.certs',
      'star.dev.meetup.com.key'
    );
    const httpCrt = path.resolve(
      os.homedir(),
      '.certs',
      'star.dev.meetup.com.crt'
    );

    httpServer = createSecureServer(
      {
        key: fs.readFileSync(httpKey),
        cert: fs.readFileSync(httpCrt),
      },
      app
    );
  } else {
    httpServer = createServer(app);
  }

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
      logger.info(
        `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
      );
      logger.info(
        `🚀 Subscriptions ready at ws://localhost:${PORT}${
          server.subscriptionsPath
        }`
      );
    });
  }
};
