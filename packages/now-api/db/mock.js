/* eslint-disable import/no-extraneous-dependencies  */
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { SchemaLink } from 'apollo-link-schema';
import schema from '../schema';

export const mockPromise = (resolver, rejecter) =>
  rejecter ? Promise.reject(rejecter) : Promise.resolve(resolver);

export const mocks = {
  scan: () => {
    throw new Error('Unimplemented mock for scan');
  },
  get: () => {
    throw new Error('Unimplemented mock for get');
  },
  put: () => {
    throw new Error('Unimplemented mock for put');
  },
  update: () => {
    throw new Error('Unimplemented mock for update');
  },
  query: () => {
    throw new Error('Unimplemented mock for query');
  },
  queryRaw: () => {
    throw new Error('Unimplemented mock for queryRaw');
  },
  getActivity: () => {
    throw new Error('Unimplemented mock for getActivity');
  },
  getEvent: () => {
    throw new Error('Unimplemented mock for getEvent');
  },
  loadMember: jest.fn(),
};

jest.mock('../db', () => ({
  scan: table => mocks.scan(table),
  get: (table, key) => mocks.get(table, key),
  getActivity: id => mocks.getActivity(id),
  getEvent: id => mocks.getEvent(id),
  put: (table, item) => mocks.put(table, item),
  update: (table, key, expr, values, names = undefined) =>
    mocks.update(table, key, expr, values, names),
  query: params => mocks.query(params),
  queryRaw: params => mocks.queryRaw(params),
}));

const apolloCache = new InMemoryCache();

export const client = new ApolloClient({
  cache: apolloCache,
  link: new SchemaLink({
    schema,
    context: {
      token: null,
      user: { id: 9 },
      loaders: { members: { load: mocks.loadMember } },
    },
  }),
});
