import { graphqlLambda, graphiqlLambda } from 'apollo-server-lambda';
import schema from './schema';

export const graphqlHandler = graphqlLambda((event, context) => ({
  schema,
  context: {
    headers: event.headers,
    functionName: context.functionName,
    event,
    context,
  },
}));

export const graphiqlHandler = graphiqlLambda({
  endpointURL: '/graphql',
});
