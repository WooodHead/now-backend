import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { get } from 'lodash';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import DataLoader from 'dataloader';
import morgan from 'morgan';
import url from 'url';
import { use as jsJodaUse } from 'js-joda';
import jsJodaTimezone from 'js-joda-timezone';
import { apolloUploadExpress } from 'apollo-upload-server';

import schema from './schema';
import { getSelf, getMember } from './api';

jsJodaUse(jsJodaTimezone);

const PORT = 3000;

const app = express();
const loaderContext = token => ({
  members: new DataLoader(ids =>
    Promise.all(ids.map(id => getMember(id, { token })))
  ),
});

// We're behind a proxy and it will read the right data
app.enable('trust proxy');

app.use(morgan('tiny'));

app.use(
  '/graphql',
  bodyParser.json(),
  apolloUploadExpress({ maxFileSize: 10 * 1024 * 1024, maxFiles: 10 }),
  graphqlExpress(req => {
    const token = get(req, ['headers', 'authorization'], '').split(' ')[1];
    const graphqlContext = {
      token,
      loaders: loaderContext(token),
      user: null,
    };
    return new Promise(resolve => {
      getSelf(graphqlContext)
        .then(({ id }) => {
          resolve({
            schema,
            context: { ...graphqlContext, user: { id: String(id) } },
          });
        })
        .catch(() => {
          resolve({
            schema,
            context: graphqlContext,
          });
        });
    });
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

const graphQLServer = createServer(app);
graphQLServer.listen(PORT, () => {
  console.log('Server initialized');
});

SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
    onConnect: ({ token }) => {
      const context = {
        token,
        loaders: loaderContext(token),
        user: null,
      };
      return new Promise(resolve => {
        getSelf(context)
          .then(({ id }) => {
            resolve({ ...context, user: { id: String(id) } });
          })
          .catch(() => {
            resolve({
              context,
            });
          });
      });
    },
  },
  {
    server: graphQLServer,
    path: '/subscriptions',
  }
);
