import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { get } from 'lodash';

import schema from './schema';
import { getSelf } from './api';

const PORT = 3000;

const app = express();

// bodyParser is needed just for POST.
app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(req => {
    const { headers } = req;
    const graphqlContext = {
      headers,
      user: null,
    };
    return new Promise(resolve => {
      getSelf(graphqlContext)
        .then(user => {
          resolve({
            schema,
            context: { ...graphqlContext, user },
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
  graphiqlExpress(req => ({
    endpointURL: '/graphql',
    passHeader: `'Authorization': 'Bearer ${get(req, ['query', 'token'])}'`,
  }))
);

app.listen(PORT);
