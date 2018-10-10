import uuid from 'uuid/v4';

import { Community, Membership, MembershipLog, User } from '../../db/repos';
import sql from '../../db/sql';

export const createMembership = async (
  userId,
  communityId,
  trx,
  validate = true
) => {
  const [existingMembership, user, community] = await Promise.all([
    Membership.get({ userId, communityId }),
    validate ? User.byId(userId) : null,
    validate ? Community.byId(communityId) : null,
  ]);
  if (existingMembership) {
    return existingMembership;
  }

  if (validate) {
    if (!user) {
      throw new Error('invalid user id');
    }
    if (!community) {
      throw new Error('invalid community id');
    }
  }

  const newMembership = Membership.withTransaction(trx).insert({
    id: uuid(),
    userId,
    communityId,
  });

  const membershipLog = MembershipLog.withTransaction(trx).insert({
    userId,
    communityId,
    action: 'add',
  });

  return Promise.all([newMembership, membershipLog]).then(
    resolvedPromises => resolvedPromises[0]
  );
};

export const removeMembership = async (userId, communityId, trx) => {
  const deletionsCount = await Membership.withTransaction(trx).delete({
    userId,
    communityId,
  });
  if (deletionsCount === 1) {
    await MembershipLog.withTransaction(trx).insert({
      userId,
      communityId,
      action: 'remove',
    });
  }
};

const membershipMutation = fn => (
  root,
  { input: { userId, communityId } },
  { loaders }
) =>
  sql.transaction(trx => fn(userId, communityId, trx)).then(() => ({
    user: () => loaders.members.load(userId),
    community: () => loaders.communities.load(communityId),
  }));

export const mutations = {
  createMembership: membershipMutation(createMembership),
  removeMembership: membershipMutation(removeMembership),
};
