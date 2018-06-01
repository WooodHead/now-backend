/* eslint-disable import/no-extraneous-dependencies  */
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { SchemaLink } from 'apollo-link-schema';

import schema from '../schema';
import loaders from './loaders';

export const USER_ID = 'aea68a98-591c-11e8-9cdb-872a15ebfd30';
export const mockPromise = (resolver, rejecter) =>
  rejecter ? Promise.reject(rejecter) : Promise.resolve(resolver);

export const mocks = {
  loadMember: jest.fn(),
};

const apolloCache = new InMemoryCache();

let isAdmin = false;

export const setAdmin = b => {
  isAdmin = b;
};

export const client = new ApolloClient({
  cache: apolloCache,
  link: new SchemaLink({
    schema,
    context: () => ({
      token: null,
      user: { id: USER_ID },
      loaders: loaders({ currentUserId: USER_ID }),
      scopes: isAdmin ? ['admin'] : [],
    }),
  }),
});

export const newUserClient = (currentUserAuth0Id, currentUserId) =>
  new ApolloClient({
    cache: apolloCache,
    link: new SchemaLink({
      schema,
      context: {
        token: null,
        currentUserAuth0Id,
        loaders: loaders({ currentUserId }),
      },
    }),
  });
