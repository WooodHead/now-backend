import { userIdFromContext, paginatify, rsvpId } from '../util';

import { update, getEvent } from '../../db';
import { userQuery } from './User';
import { TABLES } from '../../db/constants';

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
export const resolvers = { event, user };
export const mutations = { addRsvp, removeRsvp };

export const getEventRsvps = ({ eventId, first, last, after, before }) =>
  paginatify(
    {
      expr: 'eventId = :eventId',
      exprValues: { ':eventId': eventId, ':action': 'add' },
      tableName: TABLES.RSVP,
      cursorId: 'userId',
      queryParamsExtra: {
        IndexName: 'eventId-userId-index',
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
