import { userIdFromContext, paginatify, rsvpId } from '../util';

import { get, update } from '../../db';
import { user as getUser } from './User';

const putRsvp = r =>
  update(
    'now_rsvp',
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

const event = rsvp => get('now_event', { id: rsvp.eventId });

const user = (rsvp, args, context) =>
  getUser(rsvp, { id: rsvp.userId }, context);

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
    event: event(newRsvp),
  }));
};

const addRsvp = (root, { input: { eventId } }, ctx) =>
  createRsvp(eventId, userIdFromContext(ctx), 'add');

const removeRsvp = (root, { input: { eventId } }, ctx) =>
  createRsvp(eventId, userIdFromContext(ctx), 'remove');

export const getRsvps = (root, { eventId, first, last, after, before }) =>
  paginatify(
    {
      expr: 'eventId = :eventId',
      exprValues: { ':eventId': eventId },
      tableName: 'now_rsvps',
      cursorId: 'updatedAt',
    },
    {
      first,
      last,
      after,
      before,
    }
  );

export const resolvers = { event, user };
export const mutations = { addRsvp, removeRsvp };
