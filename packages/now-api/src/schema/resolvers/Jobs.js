/* eslint-disable import/prefer-default-export */
import rejectExpiredEventInvites from '../../jobs/rejectExpiredEventInvites';

export const mutations = {
  rejectExpiredEventInvites: () => rejectExpiredEventInvites().then(() => true),
};
