import { userIdFromContext } from '../util';
import { getSelf } from '../../api';
import { getUserRsvps } from './Rsvp';
import { getUser, put, update } from '../../db';
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
export const user = (root, { id }, context) => {
  if (id) {
    return context.loaders.members.load(id);
  }
  return null;
};

const currentUser = (root, vars, context) => getSelf(context);

const userQuery = (root, { id }) => getUser(id);

export const queries = { currentUser, user, nowUser: userQuery };

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
