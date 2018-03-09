import { getSelf } from '../../api';

const user = (root, { id }, context) => {
  if (id) {
    return context.loaders.members.load(id);
  }
  return null;
};

const currentUser = (root, vars, context) => getSelf(context);

export const queries = { currentUser, user };

export const resolvers = {};
