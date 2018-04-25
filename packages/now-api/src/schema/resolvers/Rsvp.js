import { toNumber, isInteger } from 'lodash';

import { userIdFromContext, paginatify, rsvpId } from '../util';
import { get, update, getEvent } from '../../db';
import { userQuery } from './User';
import { TABLES } from '../../db/constants';

const getRsvp = id => get(TABLES.RSVP, { id });

const putRsvp = r =>
  update(
    TABLES.RSVP,
    { id: r.id },
    'set eventId=:eventId, userId=:userId, #a=:a, createdAt=if_not_exists(createdAt,:createdAt), updatedAt=:updatedAt',
    {
      ':eventId': r.eventId,
      ':userId': r.userId,
      ':a': r.action,
      ':createdAt': r.createdAt,
      ':updatedAt': r.updatedAt,
    },
    { '#a': 'action' }
  );

const putRsvpTs = (id, ts) =>
  update(TABLES.RSVP, { id }, 'set lastReadTs=:ts, updatedAt=:updatedAt', {
    ':ts': ts,
    ':updatedAt': new Date().toISOString(),
  });

const event = ({ eventId }) => getEvent(eventId);

const user = (rsvp, args, context) =>
  userQuery(rsvp, { id: rsvp.userId }, context);

const createRsvp = (eventId, userId, action) => {
  const id = rsvpId(eventId, userId);
  const ISOString = new Date().toISOString();
  const newRsvp = {
    id,
    eventId,
    userId,
    action,
    createdAt: ISOString,
    updatedAt: ISOString,
  };
  return putRsvp(newRsvp).then(r => ({
    rsvp: r.Attributes,
    event: getEvent(eventId),
  }));
};

const addRsvp = (root, { input: { eventId } }, ctx) =>
  createRsvp(eventId, userIdFromContext(ctx), 'add');

const removeRsvp = (root, { input: { eventId } }, ctx) =>
  createRsvp(eventId, userIdFromContext(ctx), 'remove');

const markEventChatRead = (root, { input: { eventId, ts } }, ctx) => {
  const id = rsvpId(eventId, userIdFromContext(ctx));

  return getRsvp(id)
    .then(() => {
      if (!isInteger(toNumber(ts))) {
        throw new Error('ts must be an integer as a string');
      }

      return putRsvpTs(id, ts).then(({ Attributes }) => ({ rsvp: Attributes }));
    })
    .catch(() => {
      throw new Error('Rsvp not found');
    });
};

export const resolvers = { event, user };
export const mutations = { addRsvp, removeRsvp, markEventChatRead };

/* computes the query needed to get a list of RSVPs to an event, for
 * advanced use-cases */
export const getEventRsvpsQuery = eventId => ({
  KeyConditionExpression: 'eventId = :eventId',
  ExpressionAttributeValues: { ':eventId': eventId, ':action': 'add' },
  TableName: TABLES.RSVP,
  IndexName: 'eventId-userId-index',
  FilterExpression: '#a = :action',
  ExpressionAttributeNames: { '#a': 'action' },
});

export const getEventRsvps = ({ eventId, first, last, after, before }) => {
  const {
    KeyConditionExpression,
    ExpressionAttributeValues,
    TableName,
    ...otherParams
  } = getEventRsvpsQuery(eventId);

  return paginatify(
    {
      expr: KeyConditionExpression,
      exprValues: ExpressionAttributeValues,
      tableName: TableName,
      cursorId: 'userId',
      queryParamsExtra: otherParams,
    },
    {
      first,
      last,
      after,
      before,
    }
  );
};

export const getUserRsvps = ({ userId, first, last, after, before }) =>
  paginatify(
    {
      expr: 'userId = :userId',
      exprValues: { ':userId': userId, ':action': 'add' },
      tableName: TABLES.RSVP,
      cursorId: 'eventId',
      queryParamsExtra: {
        IndexName: 'userId-eventId-index',
        FilterExpression: '#a = :action',
        ExpressionAttributeNames: { '#a': 'action' },
      },
    },
    {
      first,
      last,
      after,
      before,
    }
  );

export const userDidRsvp = ({ eventId, userId }) =>
  get(TABLES.RSVP, { id: rsvpId(eventId, userId) }).then(
    item => !!(item && item.action === 'add')
  );
