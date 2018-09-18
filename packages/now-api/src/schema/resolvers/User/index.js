import { pick } from 'lodash';

import { getUserRsvps } from '../Rsvp';
import { getDevices } from '../Device';
import { computeAge, userIdFromContext, sqlPaginatify } from '../../util';
import {
  SQL_TABLES,
  DELETED_USER_ID,
  NOTIFICATION_PREFERENCE_MESSAGES,
  NOTIFICATION_PREFERENCE_NEW_EVENT,
  NOTIFICATION_PREFERENCE_REMINDERS,
} from '../../../db/constants';
import sql from '../../../db/sql';
import { User } from '../../../db/repos';
import { putInOrder } from '../../../util';
import { createUserMutation as createUser, updateCurrentUser } from './create';
import { tosCurrent } from './tos';
import { deleteCurrentUser } from './delete';

const fullName = () =>
  sql.raw("lower(?? || ' ' || ??)", ['firstName', 'lastName']);

export const putPhoto = (id, photoId, preview) =>
  sql(SQL_TABLES.USERS)
    .where({ id })
    .update({
      photoPreview: preview,
      photoId,
      updatedAt: new Date().toISOString(),
    });

export const blockUser = (blockerId: string, blockedId: string) =>
  sql(SQL_TABLES.BLOCKED_USERS)
    .insert({ blockerId, blockedId })
    .catch(() => null);

export const unblockUser = (blockerId: string, blockedId: string) =>
  sql(SQL_TABLES.BLOCKED_USERS)
    .where({ blockerId, blockedId })
    .delete()
    .catch(() => null);

/* Queries */
const allUsers = (root, { input, orderBy = 'id', prefix }) => {
  const args =
    prefix && prefix.length >= 1
      ? [
          fullName(),
          'like',
          sql.raw('lower(?)', `${prefix.replace(/[\\%_]/g, '')}%`),
        ]
      : [];
  const order = orderBy === 'firstName' ? fullName() : orderBy;
  return sqlPaginatify(order, User.all(...args), input);
};

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
const rsvps = ({ id: userId }, args) => {
  if (userId === DELETED_USER_ID) {
    return [];
  }
  return getUserRsvps({ userId, ...args });
};

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
        baseUrl: ctx.imageUrl,
        blocked: blocks.length > 0,
      }));
  }
  return null;
};

const age = ({ birthday }) => (birthday ? computeAge(birthday) : null);

const trimBio = ({ bio }) => {
  if (bio) {
    const trimmedBio = bio.replace(/\s+/g, ' ').trim();
    return trimmedBio !== '' ? trimmedBio : null;
  }

  return null;
};

const devices = ({ id }, args, context) => {
  if (id === userIdFromContext(context)) {
    return getDevices(id);
  }
  return null;
};

const defaultPreferences = {
  [NOTIFICATION_PREFERENCE_MESSAGES]: true,
  [NOTIFICATION_PREFERENCE_NEW_EVENT]: true,
  [NOTIFICATION_PREFERENCE_REMINDERS]: true,
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

const isDeleted = ({ id }) => id === DELETED_USER_ID;

export const resolvers = {
  rsvps,
  photo,
  age,
  bio: trimBio,
  devices,
  preferences: fillInDefaultPreferences,
  isSelf,
  tosCurrent,
  isDeleted,
};

/* Mutations */

const blockOrUnblock = (op: (string, string) => Promise<*>) => async (
  root,
  { input: { blockedUserId } },
  context
) => {
  const blockerId = userIdFromContext(context);
  const blockedUser = await getUser(blockedUserId, blockerId);
  if (blockedUserId === DELETED_USER_ID || !blockedUser) {
    throw new Error('User not found.');
  }
  await op(blockerId, blockedUserId);
  return {
    blockingUser: getUser(blockerId, blockerId),
    blockedUser,
  };
};

const blockUserMutation = blockOrUnblock(blockUser);

const unblockUserMutation = blockOrUnblock(unblockUser);

export const mutations = {
  createUser,
  updateCurrentUser,
  blockUser: blockUserMutation,
  unblockUser: unblockUserMutation,
  deleteCurrentUser,
};
