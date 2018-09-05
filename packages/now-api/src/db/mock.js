/* eslint-disable import/no-extraneous-dependencies  */
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { SchemaLink } from 'apollo-link-schema';

import loaders from './loaders';

import schema from '../schema';

export const USER_ID = 'aea68a98-591c-11e8-9cdb-872a15ebfd30';
export const mockPromise = (resolver, rejecter) =>
  rejecter ? Promise.reject(rejecter) : Promise.resolve(resolver);

export const mocks = {
  loadMember: jest.fn(),
};

const apolloCache = new InMemoryCache();

const noCache = {
  watchQuery: {
    fetchPolicy: 'network-only',
  },
  query: {
    fetchPolicy: 'network-only',
  },
};

let isAdmin = false;

export const setAdmin = b => {
  isAdmin = b;
};
const userAgent = {
  client: 'unknown',
  clientVersion: 'unknown',
  platform: 'unknown',
  osVersion: 'unknown',
  buildNumber: 'unknown',
};

const defaultContext = () => ({
  token: null,
  user: { id: USER_ID },
  loaders: loaders({ currentUserId: USER_ID }),
  scopes: isAdmin ? ['admin'] : [],
  userAgent,
});

export const client = new ApolloClient({
  cache: apolloCache,
  link: new SchemaLink({
    schema,
    context: defaultContext,
  }),
  defaultOptions: noCache,
});

export const newUserClient = (currentUserAuth0Id, currentUserId) =>
  new ApolloClient({
    cache: apolloCache,
    link: new SchemaLink({
      schema,
      context: {
        ...defaultContext(),
        currentUserAuth0Id,
        user: undefined,
        loaders: loaders({ currentUserId }),
      },
    }),
    defaultOptions: noCache,
  });

export const userAgentClient = ua =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: new SchemaLink({
      schema,
      context: () => ({ ...defaultContext(), userAgent: ua }),
    }),
    defaultOptions: noCache,
  });
