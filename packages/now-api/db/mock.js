/* eslint-disable import/no-extraneous-dependencies  */
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { SchemaLink } from 'apollo-link-schema';
import schema from '../schema';

export const mockPromise = (resolver, rejecter) =>
  rejecter ? Promise.reject(rejecter) : Promise.resolve(resolver);

export const mocks = {
  scan: () => {},
  get: () => {},
  put: () => {},
  update: () => {},
  getTemplate: () => {},
};

jest.mock('../db', () => ({
  scan: table => mocks.scan(table),
  get: (table, key) => mocks.get(table, key),
  put: () => mocks.put,
  update: () => mocks.update,
  getTemplate: id => mocks.get('now_template', { id }),
}));

const apolloCache = new InMemoryCache();

export const client = new ApolloClient({
  cache: apolloCache,
  link: new SchemaLink({ schema }),
});
