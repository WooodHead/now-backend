import { uniq } from 'lodash';
import { getDevices } from '../schema/resolvers/Device';
import { SQL_TABLES } from '../db/constants';
import sql from '../db/sql';
import { Rsvp } from '../db/repos';
import { validUserPref } from './util';

/*
 * Given an event id, returns a Promise which will eventually resolve to the
 * list of all FCM tokens for users who are RSVPed to that event and agree
 * to receive the relevant sort of notifs.
 */
export const getTokensForEvent = (eventId, prefName, excludeUsers = []) =>
  // TODO: turn this into a join
  Rsvp.all({ action: 'add', eventId })
    .then(rsvps =>
      rsvps
        .map(({ userId }) => userId)
        .filter(userId => !excludeUsers.includes(userId))
    )
    .then(userIds =>
      sql(SQL_TABLES.USERS)
        .whereIn('id', userIds)
        .select('id', 'preferences')
    )
    .then(users => users.filter(validUserPref(prefName)).map(({ id }) => id))
    .then(userIds => uniq(userIds))
    .then(userIds =>
      Promise.all(userIds.map(userId => getDevices(userId).select('token')))
    )
    .then(results => [].concat(...results).map(({ token }) => token));

export const getTokensForRsvp = async (rsvpId, prefName) => {
  const rsvp = await Rsvp.byId(rsvpId);
  if (!rsvp || !rsvp.userId) {
    return Promise.resolve([]);
  }

  const user = await sql(SQL_TABLES.USERS)
    .where({ id: rsvp.userId })
    .select('id', 'preferences')
    .first();

  if (validUserPref(prefName)(user)) {
    const devices = await getDevices(user.id).select('token');

    return devices.map(({ token }) => token);
  }

  return Promise.resolve([]);
};
