import { pick } from 'lodash';
import uuid from 'uuid/v4';

import { computeAge, userIdFromContext } from '../util';
import { getUserRsvps } from './Rsvp';
import {
  batchGet,
  get,
  put,
  query,
  update,
  updateDynamic,
  createSet,
} from '../../db';
import { TABLES } from '../../db/constants';
import { getDevices } from './Device';
import { updatePref as updateFcmPref } from '../../fcm';
import { putInOrder } from '../../util';

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

export const blockUser = (blockerId, blockedId) =>
  update(
    TABLES.USER,
    { id: blockerId },
    'add #oldIds :newIds set updatedAt=:updatedAt',
    {
      ':newIds': createSet([blockedId]),
      ':updatedAt': new Date().toISOString(),
    },
    {
      '#oldIds': 'blockedUsers',
    },
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
  if (!user) return null;
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
  get(TABLES.USER, { id }).then(user => filterAttributes(currentUserId)(user));

export const getUserBatch = (ids, currentUserId) =>
  batchGet(TABLES.USER, ids).then(users =>
    putInOrder(users, ids).map(filterAttributes(currentUserId))
  );

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
const photo = ({ id, photoId, photoPreview }, args, { user }) => {
  const blockedUsers =
    (user && user.blockedUsers && user.blockedUsers.values) || [];
  if (photoId) {
    return {
      id: photoId,
      preview: photoPreview,
      baseUrl: 'https://now.meetup.com/images', // TODO: figure out how to get the server url in here
      blocked: blockedUsers.includes(id),
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

const defaultPreferences = {
  messagesNotification: true,
  newEventNotification: true,
  remindersNotification: true,
};

const fillInDefaultPreferences = (
  { id, preferences: fromDb },
  args,
  context
) => {
  if (id !== userIdFromContext(context)) return null;
  return Object.assign({}, defaultPreferences, fromDb);
};

const isSelf = ({ id }, args, context) => id === userIdFromContext(context);

export const resolvers = {
  rsvps,
  photo,
  age,
  devices,
  preferences: fillInDefaultPreferences,
  isSelf,
};

const maybeUpdateFcm = (preferences, userId, force = false) => {
  const havePref = preferences && 'newEventNotification' in preferences;
  const pref = havePref ? preferences.newEventNotification : true;
  if (havePref || force) {
    updateFcmPref(pref, userId);
  }
};

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
    blockedUsers: createSet(['placeholder']),
    birthday: birthday.toString(),
    auth0Id: context.currentUserAuth0Id,
    createdAt: now,
    updatedAt: now,
  };
  return createUser(newUser).then(() => {
    maybeUpdateFcm(preferences, newId, true);
    return { user: getUser(newId) };
  });
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
  return putUser(newUser).then(u => {
    maybeUpdateFcm(input.preferences, id);
    return {
      user: filterAttributes(id)(u.Attributes),
    };
  });
};

const blockUserMutation = (root, { input: { blockedUserId } }, context) => {
  const blockerId = userIdFromContext(context);
  return blockUser(blockerId, blockedUserId).then(({ Attributes }) => ({
    blockingUser: filterAttributes(blockerId)(Attributes),
    blockedUser: getUser(blockedUserId),
  }));
};

export const mutations = {
  createUser: createUserMutation,
  updateCurrentUser,
  blockUser: blockUserMutation,
};
