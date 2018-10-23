import {
  defaultCursorSerializer,
  sqlPaginatify,
  userIdFromContext,
} from '../util';
import {
  Community,
  CommunityWhitelist,
  Membership,
  User,
} from '../../db/repos';
import { genRandomUuid, now } from '../../db/sql';
import { isAdmin } from '../AdminDirective';
import { GLOBAL_COMMUNITY_ID } from '../../db/constants';
import { createMembership } from './Membership';

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

const manyCommunities = (root, { ids }, { loaders }) =>
  loaders.communities.loadMany(ids);

export const queries = {
  allCommunities,
  community: communityQuery,
  manyCommunities,
};

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

const isPublic = ({ id }) => id === GLOBAL_COMMUNITY_ID;

export const resolvers = { users, isPublic };

// utility function for other resolvers to make sure a community exists and
// is visible
export const verifyCommunity = (communityId, context) =>
  communityQuery({}, { id: communityId }, context).then(community => {
    if (!community) {
      throw new Error('No Such Community');
    }
    return true;
  });

export const addUserToWhitelistedCommunities = async (userId, trx) => {
  const user = await User.byId(userId).transacting(trx);

  // TODO: Check that user is verified

  const whitelists = await CommunityWhitelist.all({
    email: user.email,
  }).transacting(trx);

  const memberships = whitelists.map(({ communityId }) =>
    createMembership(userId, communityId, trx, false)
  );

  return Promise.all(memberships);
};
