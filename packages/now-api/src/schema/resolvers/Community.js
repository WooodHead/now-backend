import {
  defaultCursorSerializer,
  sqlPaginatify,
  userIdFromContext,
} from '../util';
import { Community, Membership } from '../../db/repos';
import { genRandomUuid, now } from '../../db/sql';
import { isAdmin } from '../AdminDirective';

const allCommunities = (root, { input, orderBy = 'id' }) =>
  sqlPaginatify(orderBy, Community.all({}), input);

const communityQuery = (root, { id }, context) =>
  (isAdmin(context)
    ? Community.byId(id)
    : Community.get({
        'communities.id': id,
        'memberships.userId': userIdFromContext(context),
      })
        .column('communities.*')
        .innerJoin('memberships', {
          'memberships.communityId': 'communities.id',
        })
  ).then(community => {
    context.loaders.communities.prime(id, community);
    return community;
  });

export const queries = { allCommunities, community: communityQuery };

const createCommunity = (root, { input: { name } }, { loaders }) =>
  Community.insert({ id: genRandomUuid(), name })
    .returning('id')
    .then(([id]) => ({
      community: loaders.communities.load(id),
    }));

const updateCommunity = async (
  root,
  { input: { id, ...fields } },
  { loaders }
) => {
  loaders.communities.clear(id);

  const updateCount = await Community.update({
    id,
    ...fields,
    updatedAt: now(),
  });

  if (updateCount === 0) {
    throw new Error('Community not found');
  }

  return {
    community: loaders.communities.load(id),
  };
};

export const mutations = { createCommunity, updateCommunity };

const users = ({ id: communityId }, { input = {} }, context) =>
  sqlPaginatify('id', Membership.all({ communityId }), {
    ...input,
    edgeBuilder: (cursorId, membership) => ({
      cursor: defaultCursorSerializer(cursorId, membership),
      node: context.loaders.members.load(membership.userId),
      ...membership,
    }),
  });

export const resolvers = { users };
