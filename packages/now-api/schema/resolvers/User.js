import { pick } from 'lodash';

import { userIdFromContext } from '../util';
import { getUserRsvps } from './Rsvp';
import { get, put, query, update } from '../../db';
import { TABLES } from '../../db/constants';

const createUser = u => put(TABLES.USER, u, 'attribute_not_exists(id)');

const putUser = u =>
  update(
    TABLES.USER,
    { id: u.id },
    'set lastName=:lastName, firstName=:firstName, bio=:bio, updatedAt=:updatedAt',
    {
      ':lastName': u.lastName,
      ':firstName': u.firstName,
      ':bio': u.bio,
      ':updatedAt': u.updatedAt,
    }
  );

/* Queries */
export const userQuery = (root, { id }, context) => {
  if (id) {
    return context.loaders.members.load(id);
  }
  return null;
};

const filterAttributes = id => user => {
  // many fields are always available
  const fields = [
    'id',
    'bio',
    'createdAt',
    'firstName',
    'lastName',
    'location',
    'updatedAt',
  ];
  // some fields are available only to the currently-authenticated user
  if (id === user.id) {
    fields.push('email');
  }
  // other fields (including, notably, auth0Id) are not available to API clients at all
  return pick(user, fields);
};

export const getUser = (id, currentUserId) =>
  get(TABLES.USER, { id }).then(user => {
    if (!user) {
      return null;
    }
    return filterAttributes(currentUserId)(user);
  });

export const getByAuth0Id = auth0Id =>
  query({
    TableName: TABLES.USER,
    KeyConditionExpression: 'auth0Id = :auth0Id',
    ExpressionAttributeValues: { ':auth0Id': auth0Id },
    IndexName: 'auth0Id-index',
  }).then(items => {
    if (items.length === 0) return null;
    else if (items.length === 1) return items[0];
    return Promise.reject(
      new Error(`unexpectedly got ${items.length} users from db`)
    );
  });

const currentUser = (root, vars, context) => {
  const id = userIdFromContext(context);
  return getUser(id, id).then(filterAttributes(id));
};

export const queries = { currentUser, user: userQuery };

/* Resolvers */
const rsvps = (root, args) => getUserRsvps({ userId: root.id, ...args });

export const resolvers = { rsvps };

/* Mutations */
const createUserMutation = (
  root,
  { input: { email, id, firstName, lastName, bio, location } },
  context
) => {
  const newId = userIdFromContext(context);
  const ISOString = new Date().toISOString();
  const newUser = {
    id: newId,
    meetupId: id,
    email,
    firstName,
    lastName,
    bio,
    location,
    createdAt: ISOString,
    updatedAt: ISOString,
  };
  return createUser(newUser).then(() => ({ user: getUser(newId) }));
};

const updateCurrentUser = (
  root,
  { input: { id, firstName, lastName, bio } },
  context
) => {
  if (userIdFromContext(context) !== id) {
    throw new Error('User must be authenticated in order to edit profile');
  }

  const ISOString = new Date().toISOString();
  const newUser = {
    id,
    firstName,
    lastName,
    bio,
    updatedAt: ISOString,
  };

  return putUser(newUser).then(u => ({ user: u.Attributes }));
};

export const mutations = {
  createUser: createUserMutation,
  updateCurrentUser,
};
