import { graphqlLambda, graphiqlLambda } from 'apollo-server-lambda';
import schema from './schema';
import { getSelf } from './api';

export const graphqlHandler = graphqlLambda((event, context) => {
  const { headers } = event;
  const { functionName } = context;
  const graphqlContext = {
    headers,
    functionName,
    event,
    context,
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
});

export const graphiqlHandler = graphiqlLambda({
  endpointURL: '/prod/graphql',
});
