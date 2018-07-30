/* eslint-disable import/prefer-default-export */
import { mapValues } from 'lodash';
import { userIdFromContext } from './util';

/**
 * Given a list of GraphQL resolvers, wraps them in a function which will
 * check that the user is logged in before proceeding.
 * @param entries
 * @param invalidUserOk a list of functions which will _not_ be wrapped
 */
const wrapEntries = (entries, ...invalidUserOk) =>
  mapValues(entries, (resolver, key) => {
    if (invalidUserOk.includes(key)) {
      return resolver;
    }

    return (obj, args, context, info) => {
      if (!userIdFromContext(context)) {
        throw new Error('No valid authorization provided');
      }
      return resolver(obj, args, context, info);
    };
  });

/**
 * Call wrapEntries(above) as appropriate for our schema.
 */
export const wrapResolvers = schema => ({
  ...schema,
  Query: wrapEntries(schema.Query, 'invitation', 'checkInvitation'),
  Mutation: wrapEntries(schema.Mutation, 'createUser'),
  Subscription: schema.Subscription,
});
