const server = require('apollo-server-lambda');
const schema = require('./schema');

exports.graphqlHandler = server.graphqlLambda((event, context) => ({
  schema,
  context: {
    headers: event.headers,
    functionName: context.functionName,
    event,
    context,
  },
}));

exports.graphiqlHandler = server.graphiqlLambda({
  endpointURL: '/Prod/graphql',
});
