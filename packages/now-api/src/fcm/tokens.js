/* eslint-disable import/prefer-default-export */
import { uniq } from 'lodash';
import { batchGet, query, TABLES } from '../db';
import { getEventRsvpsQuery } from '../schema/resolvers/Rsvp';
import { getDevices } from '../schema/resolvers/Device';

/*
 * Given an event id, returns a Promise which will eventually resolve to the
 * list of all FCM tokens for users who are RSVPed to that event and agree
 * to receive the relevant sort of notifs.
 */
export const getTokensForEvent = (eventId, prefName, excludeUsers = []) =>
  query({
    ...getEventRsvpsQuery(eventId),
    ProjectionExpression: 'userId',
  })
    .then(rsvps =>
      rsvps
        .map(({ userId }) => userId)
        .filter(userId => !excludeUsers.includes(userId))
    )
    .then(userIds =>
      batchGet(TABLES.USER, userIds, 'id', {
        ProjectionExpression: `id, preferences.${prefName}`,
      })
    )
    .then(users =>
      users
        .filter(
          ({ preferences }) => !(preferences && preferences[prefName] === false)
        )
        .map(({ id }) => id)
    )
    .then(userIds => uniq(userIds))
    .then(userIds =>
      Promise.all(
        userIds.map(userId =>
          getDevices(userId, {
            ProjectionExpression: '#t',
            ExpressionAttributeNames: { '#t': 'token' },
          })
        )
      )
    )
    .then(results => [].concat(...results).map(({ token }) => token));
