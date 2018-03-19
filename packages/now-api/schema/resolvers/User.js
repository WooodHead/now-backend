import { getSelf } from '../../api';
import { getUserRsvps } from './Rsvp';

export const user = (root, { id }, context) => {
  if (id) {
    return context.loaders.members.load(id);
  }
  return null;
};

const currentUser = (root, vars, context) => getSelf(context);

export const queries = { currentUser, user };

const rsvps = (root, args) => getUserRsvps({ userId: root.id, ...args });

export const resolvers = { rsvps };
