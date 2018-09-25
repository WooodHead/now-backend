// @flow
import rp from 'request-promise-native';

import { endpoint, accessToken } from './credentials';

type CallOpts = {
  path: string,
  method: 'GET' | 'POST' | 'DELETE' | 'PUT',
  headers?: { [string]: string },
};

const call = ({ path, headers = {}, ...opts }: CallOpts) =>
  accessToken().then(token =>
    rp({
      uri: `${endpoint}/api/v2/${path}`,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
        ...headers,
      },
      ...opts,
    })
  );

export const getUser = (id: string) =>
  call({
    method: 'GET',
    path: `users/${id}`,
  });

export const deleteUser = (id: string) =>
  call({
    method: 'DELETE',
    path: `users/${id}`,
  });

export const getLogs = (from: ?string) =>
  call({
    method: 'GET',
    path: 'logs',
    qs: { from, take: '100' },
  });
