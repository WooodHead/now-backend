import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import { apolloUploadExpress } from 'apollo-upload-server';
import bodyParser from 'body-parser';

import cors from 'cors';
import express from 'express';
import jwt from 'express-jwt';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { use as jsJodaUse } from 'js-joda';
import jsJodaTimezone from 'js-joda-timezone';
import jwksRsa from 'jwks-rsa';
import { get } from 'lodash';
import morgan from 'morgan';
import sharp from 'sharp';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import url from 'url';

import schema from './schema';
import { getByAuth0Id } from './schema/resolvers/User';
import resizer from './resizer';
import loaders from './db/loaders';
import { s3, NOW_ADMIN_BUCKET, streamObject } from './s3';

const isDev = process.env.NODE_ENV === 'development';

jsJodaUse(jsJodaTimezone);

// http://sharp.pixelplumbing.com/en/stable/install/#alpine-linux
sharp.cache(false);

const PORT = 3000;

const app = express();

const loaderContext = options => loaders(options);

// We're behind a proxy and it will read the right data
app.enable('trust proxy');

if (isDev) {
  app.use(cors());
}
app.use(morgan('common'));

const buildUserForContext = (req, otherContext = {}) => {
  const currentUserAuth0Id = get(req, ['user', 'sub']);
  const scope = get(req, ['user', 'scope']) || '';
  const context = {
    ...otherContext,
    currentUserAuth0Id,
    user: undefined,
    loaders: loaderContext({ currentUserId: null }),
    scopes: [],
  };
  if (!currentUserAuth0Id) {
    return Promise.resolve(context);
  }
  return getByAuth0Id(currentUserAuth0Id).then(user => {
    if (user) {
      const loadersWithContext = loaderContext({ currentUserId: user.id });
      loadersWithContext.members.prime(user.id, user);
      return {
        ...context,
        user,
        loaders: loadersWithContext,
        scopes: scope.split(' '),
      };
    }
    return context;
  });
};

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://meetupnow.auth0.com/.well-known/jwks.json',
  }),
  credentialsRequired: true,
  audience: 'https://now.meetup.com/graphql',
  issuer: 'https://meetupnow.auth0.com/',
  algorithms: ['RS256'],
});

app.use(
  '/graphql',
  checkJwt,
  bodyParser.json(),
  apolloUploadExpress({ maxFileSize: 10 * 1024 * 1024, maxFiles: 10 }),
  graphqlExpress((req, res) => {
    if (!req.user) {
      return res.send(401);
    }
    return buildUserForContext(req, { http: true }).then(context => ({
      schema,
      context,
      debug: isDev,
      tracing: isDev,
      logFunction: isDev || process.env.VERBOSE ? console.log : () => {},
    }));
  })
);

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

app.get('/images/:width(\\d+)x:height(\\d+)/:originalKey(*)', resizer);

app.get('/admin/?:path(*)', ({ params: { path } }, res) => {
  const params = { Bucket: NOW_ADMIN_BUCKET, Key: path || 'index.html' };
  s3
    .headObject(params)
    .promise()
    .catch(e => {
      res.send(e.statusCode);
      return undefined;
    })
    .then(data => {
      if (data) {
        streamObject(res, params, data);
      }
    });
});

const graphQLServer = createServer(app);
graphQLServer.listen(PORT, () => {
  console.log(`Server initialized -- ${process.env.NODE_ENV}`);
});

SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
    onConnect: ({ token }) =>
      new Promise((resolve, reject) => {
        const req = { headers: { authorization: `Bearer ${token}` } };
        checkJwt(req, null, err => {
          if (err) {
            reject(new Error('error authorizing'));
          } else {
            resolve(buildUserForContext(req, { websocket: true }));
          }
        });
      }),
  },
  {
    server: graphQLServer,
    path: '/subscriptions',
  }
);
