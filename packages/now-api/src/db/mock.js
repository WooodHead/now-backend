/* eslint-disable import/no-extraneous-dependencies  */
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { SchemaLink } from 'apollo-link-schema';
import { makeExecutableSchema } from 'graphql-tools';
import gql from 'graphql-tag';
import { mergeTypes } from 'merge-graphql-schemas';

import loaders from './loaders';

import typeDefs from '../schema/typeDefs';
import resolvers from '../schema/resolvers';
import AdminDirective from '../schema/AdminDirective';

const uploadScalar = gql`
  scalar Upload
`;

export const schema = makeExecutableSchema({
  typeDefs: mergeTypes([typeDefs, uploadScalar]),
  resolvers,
  schemaDirectives: {
    admin: AdminDirective,
  },
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
  inheritResolversFromInterfaces: true,
});

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
  });

export const userAgentClient = ua =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: new SchemaLink({
      schema,
      context: () => ({ ...defaultContext(), userAgent: ua }),
    }),
  });
