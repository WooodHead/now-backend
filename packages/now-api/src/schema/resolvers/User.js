import { pick } from 'lodash';
import uuid from 'uuid/v4';

import { computeAge, userIdFromContext, sqlPaginatify } from '../util';
import { getUserRsvps } from './Rsvp';
import { SQL_TABLES } from '../../db/constants';
import sql from '../../db/sql';
import { getDevices } from './Device';
import { updatePref as updateFcmPref } from '../../fcm';
import { putInOrder } from '../../util';
import { User } from '../../db/repos';

const CURRENT_TOS_VERSION = '8.0';

const createUser = u => sql(SQL_TABLES.USERS).insert(u);

const putUser = ({ id, ...otherFields }) =>
  sql(SQL_TABLES.USERS)
    .where({ id })
    .update(otherFields);
// updateDynamic(TABLES.USER, { id }, otherFields, 'attribute_exists(id)');

export const putPhoto = (id, photoId, preview) =>
  sql(SQL_TABLES.USERS)
    .where({ id })
    .update({
      photoPreview: preview,
      photoId,
      updatedAt: new Date().toISOString(),
    });

export const blockUser = (blockerId, blockedId) =>
  sql(SQL_TABLES.BLOCKED_USERS)
    .insert({ blockerId, blockedId })
    .catch(() => null);

/* Queries */
const allUsers = (root, { input: { orderBy = 'id', ...pageParams } }) =>
  sqlPaginatify(orderBy, User.all({}), pageParams);

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
    fields.push('email', 'birthday', 'preferences', 'tosVersion');
  }
  // other fields (including, notably, auth0Id) are not available to API clients at all
  return pick(user, fields);
};

export const getUser = (id, currentUserId) =>
  sql(SQL_TABLES.USERS)
    .where({ id })
    .then(users => {
      if (users.length === 1) {
        return filterAttributes(currentUserId)(users[0]);
      }
      return null;
    });

export const getUserBatch = (ids, currentUserId) =>
  User.batch(ids).then(users =>
    putInOrder(users, ids).map(filterAttributes(currentUserId))
  );

export const getByAuth0Id = auth0Id =>
  sql(SQL_TABLES.USERS)
    .where({ auth0Id })
    .then(items => {
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

export const queries = { currentUser, user: userQuery, allUsers };

/* Resolvers */
const rsvps = (root, args) => getUserRsvps({ userId: root.id, ...args });
const photo = ({ id, photoId, photoPreview }, args, ctx) => {
  const loggedInUserId = userIdFromContext(ctx);
  if (photoId) {
    return sql(SQL_TABLES.BLOCKED_USERS)
      .where({
        blockerId: loggedInUserId,
        blockedId: id,
      })
      .then(blocks => ({
        id: photoId,
        preview: photoPreview,
        baseUrl: 'https://now.meetup.com/images', // TODO: figure out how to get the server url in here
        blocked: blocks.length > 0,
      }));
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

const tosCurrent = ({ tosVersion }) =>
  typeof tosVersion === 'string' ? tosVersion === CURRENT_TOS_VERSION : null;

export const resolvers = {
  rsvps,
  photo,
  age,
  devices,
  preferences: fillInDefaultPreferences,
  isSelf,
  tosCurrent,
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
    birthday: birthday.toString(),
    auth0Id: context.currentUserAuth0Id,
    createdAt: now,
    updatedAt: now,
    tosVersion: CURRENT_TOS_VERSION,
  };
  return createUser(newUser).then(() => {
    maybeUpdateFcm(preferences, newId, true);
    return { user: getUser(newId, newId) };
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
  return putUser(newUser)
    .then(() => context.loaders.members.load(id))
    .then(u => {
      maybeUpdateFcm(input.preferences, id);
      return {
        user: u,
      };
    });
};

const blockUserMutation = (root, { input: { blockedUserId } }, context) => {
  const blockerId = userIdFromContext(context);
  return blockUser(blockerId, blockedUserId).then(() => ({
    blockingUser: getUser(blockerId, blockerId),
    blockedUser: getUser(blockedUserId, blockerId),
  }));
};

export const mutations = {
  createUser: createUserMutation,
  updateCurrentUser,
  blockUser: blockUserMutation,
};
