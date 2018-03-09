import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { get } from 'lodash';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import DataLoader from 'dataloader';
import url from 'url';

import schema from './schema';
import { getSelf, getMember } from './api';

const PORT = 3000;

const app = express();

const loaderContext = token => ({
  members: new DataLoader(ids =>
    Promise.all(ids.map(id => getMember(id, { token })))
  ),
});

app.use(
  '/graphql',
  bodyParser.json(),
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
graphQLServer.listen(PORT);

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
