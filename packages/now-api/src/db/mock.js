/* eslint-disable import/no-extraneous-dependencies  */
import ApolloClient from 'apollo-client';
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import { SchemaLink } from 'apollo-link-schema';
import { Server, WebSocket } from 'mock-socket-with-protocol';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { WebSocketLink } from 'apollo-link-ws';
import { split } from 'apollo-link';
import { execute, subscribe } from 'graphql';
import { getMainDefinition } from 'apollo-utilities';

import introspectionQueryResultData from './fragmentTypes.json';
import loaders from './loaders';
import schema from '../schema';

export const USER_ID = 'aea68a98-591c-11e8-9cdb-872a15ebfd30';
export const mockPromise = (resolver, rejecter) =>
  rejecter ? Promise.reject(rejecter) : Promise.resolve(resolver);

export const mocks = {
  loadMember: jest.fn(),
};

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

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
});

const apolloCache = new InMemoryCache({ fragmentMatcher });

export const subClient = () => {
  // To make the point clear that we are not opening any ports here we use a randomized string that will not produce a correct port number.
  // This example of WebSocket client/server uses string matching to know to what server connect a given client.
  // We are randomizing because we should use different string for every test to not share state.
  const RANDOM_WS_PORT = Math.floor(Math.random() * 100000);
  const customServer = new Server(`ws://localhost:${RANDOM_WS_PORT}`);

  // We pass customServer instead of typical configuration of a default WebSocket server
  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: () => Promise.resolve(defaultContext()),
    },
    customServer
  );

  // The uri of the WebSocketLink has to match the customServer uri.
  const wsLink = new WebSocketLink({
    uri: `ws://localhost:${RANDOM_WS_PORT}`,
    webSocketImpl: WebSocket,
  });

  const schemaLink = new SchemaLink({
    schema,
    context: defaultContext,
  });

  const client = new ApolloClient({
    cache: apolloCache,
    link: split(
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      wsLink,
      schemaLink
    ),
    defaultOptions: noCache,
  });

  return client;
};

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
        user: currentUserId ? { id: currentUserId } : undefined,
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
