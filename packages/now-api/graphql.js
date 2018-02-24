import { graphqlLambda, graphiqlLambda } from 'apollo-server-lambda';
import fetch from 'node-fetch';
import schema from './schema';

export const graphqlHandler = graphqlLambda((event, context) => {
  const { headers } = event;
  const { functionName } = context;
  const { Authorization } = headers;
  const graphqlContext = {
    headers,
    functionName,
    event,
    context,
    user: null,
  };
  return new Promise((resolve, reject) => {
    if (Authorization) {
      const token = Authorization.split(' ')[1];
      fetch(`https://api.meetup.com/members/self?access_token=${token}`)
        .then(resp => resp.json())
        .then(user => {
          resolve({
            schema,
            context: { ...graphqlContext, user },
          });
        })
        .catch(e => {
          reject(e);
        });
    } else {
      resolve({
        schema,
        context: graphqlContext,
      });
    }
  });
});

export const graphiqlHandler = graphiqlLambda({
  endpointURL: '/prod/graphql',
});
