import { get } from 'lodash';
import fetch from 'node-fetch';

const API_BASE = 'https://api.meetup.com/';

const getToken = context => {
  const Authorization = get(context, ['headers', 'Authorization']);
  if (Authorization) {
    return Authorization.split(' ')[1];
  }
  return null;
};

const apiGet = (path, context) =>
  fetch(`${API_BASE}${path}?access_token=${getToken(context)}`).then(resp =>
    resp.json()
  );

export const getSelf = context => apiGet('members/self', context);

export const getMember = (id, context) => apiGet(`members/${id}`, context);
