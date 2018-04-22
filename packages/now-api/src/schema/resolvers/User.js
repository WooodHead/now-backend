import { pick } from 'lodash';
import uuid from 'uuid/v4';

import { computeAge, userIdFromContext } from '../util';
import { getUserRsvps } from './Rsvp';
import { get, put, query, update, updateDynamic } from '../../db';
import { TABLES } from '../../db/constants';
import { getDevices } from './Device';

const createUser = u => put(TABLES.USER, u, 'attribute_not_exists(id)');

const putUser = ({ id, ...otherFields }) =>
  updateDynamic(TABLES.USER, { id }, otherFields, 'attribute_exists(id)');

export const putPhoto = (userId, photoId, preview) =>
  update(
    TABLES.USER,
    { id: userId },
    'set photoPreview=:photoPreview, photoId=:photoId, updatedAt=:updatedAt',
    {
      ':photoPreview': preview,
      ':photoId': photoId,
      ':updatedAt': new Date().toISOString(),
    },
    undefined,
    'attribute_exists(id)' // prevent creating a row if the user doesn't exist
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
    'photoId',
    'photoPreview',
    'updatedAt',
  ];
  // some fields are available only to the currently-authenticated user
  if (id === user.id) {
    fields.push('email', 'birthday', 'preferences');
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
  return context.loaders.members.load(id);
};

export const queries = { currentUser, user: userQuery };

/* Resolvers */
const rsvps = (root, args) => getUserRsvps({ userId: root.id, ...args });
const photo = root => {
  if (root.photoId) {
    return {
      id: root.photoId,
      preview: root.photoPreview,
      baseUrl: 'https://dd116wbqbi5t0.cloudfront.net',
    };
  }
  return null;
};

const age = ({ birthday }) => (birthday ? computeAge(birthday) : null);

const devices = ({ id }, args, context) => {
  if (id === userIdFromContext(context)) {
    return getDevices(id);
  }
  return null;
};

export const resolvers = { rsvps, photo, age, devices };

/* Mutations */
const createUserMutation = (
  root,
  {
    input: {
      email,
      firstName,
      lastName,
      bio,
      location,
      preferences = {},
      birthday,
    },
  },
  context
) => {
  if (userIdFromContext(context)) {
    throw new Error('User has already been created.');
  }

  const newId = uuid();
  const now = new Date().toISOString();
  const newUser = {
    id: newId,
    email,
    firstName,
    lastName,
    bio,
    location,
    preferences,
    birthday: birthday.toString(),
    auth0Id: context.currentUserAuth0Id,
    createdAt: now,
    updatedAt: now,
  };
  return createUser(newUser).then(() => ({ user: getUser(newId) }));
};

const updateCurrentUser = (root, { input }, context) => {
  const id = userIdFromContext(context);
  if (!id) {
    throw new Error('User must be authenticated in order to edit profile');
  }

  const { birthday } = input;

  const now = new Date().toISOString();
  const newUser = {
    id,
    ...pick(input, ['firstName', 'lastName', 'bio', 'preferences']),
    ...(birthday ? { birthday: birthday.toString() } : {}),
    updatedAt: now,
  };

  context.loaders.members.clear(id);
  return putUser(newUser).then(u => ({
    user: filterAttributes(id)(u.Attributes),
  }));
};

export const mutations = {
  createUser: createUserMutation,
  updateCurrentUser,
};
