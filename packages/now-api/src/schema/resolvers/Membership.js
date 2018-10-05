import uuid from 'uuid/v4';

import { Membership, MembershipLog } from '../../db/repos';

export const createMembership = async (userId, communityId, trx) => {
  const existingMembership = await Membership.get({ userId, communityId });
  if (existingMembership) {
    return Promise.resolve(existingMembership);
  }

  const newMembership = Membership.insert({
    id: uuid(),
    userId,
    communityId,
  }).transacting(trx);

  const membershipLog = MembershipLog.insert({
    userId,
    communityId,
    action: 'add',
  }).transacting(trx);
  return Promise.all([newMembership, membershipLog]).then(
    resolvedPromises => resolvedPromises[0]
  );
};

export const removeMembership = (userId, communityId) => {
  const deleteMembership = Membership.delete({ userId, communityId });
  const membershipLog = MembershipLog.insert({
    userId,
    communityId,
    action: 'remove',
  });
  return Promise.all([deleteMembership, membershipLog]);
};
