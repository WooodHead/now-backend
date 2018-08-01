import { getDevices } from '../schema/resolvers/Device';
import { SQL_TABLES } from '../db/constants';
import sql from '../db/sql';
import { Device, Rsvp } from '../db/repos';
import { validUserPref } from './util';

/*
 * Given an event id, returns a Promise which will eventually resolve to the
 * list of all FCM tokens for users who are RSVPed to that event and agree
 * to receive the relevant sort of notifs.
 */
export const getTokensForEvent = (eventId, prefName, excludeUsers = []) => {
  const userIds = sql(SQL_TABLES.RSVPS)
    .distinct('userId')
    .select()
    .innerJoin(SQL_TABLES.USERS, 'rsvps.userId', 'users.id')
    .whereNotIn('userId', excludeUsers)
    .andWhere({ eventId, 'rsvps.action': 'add' })
    .andWhere(
      sql.raw('coalesce(users.preferences->?, ?)=?', [prefName, 'true', 'true'])
    );
  return Device.all()
    .select('token')
    .whereIn('userId', userIds)
    .then(results => results.map(({ token }) => token));
};

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
