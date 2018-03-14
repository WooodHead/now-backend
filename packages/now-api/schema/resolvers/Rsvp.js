import uuid from 'uuid';
import { userIdFromContext, paginatify } from '../util';

import { get, put } from '../../db';

const putRsvp = e => put('now_rsvp', e);
const event = rsvp => get('now_event', { id: rsvp.eventId });

const createRsvp = (eventId, userId, action) => {
  const id = uuid.v1();
  const ISOString = new Date().toISOString();
  const newRsvp = {
    id,
    eventId,
    userId,
    action,
    createdAt: ISOString,
    updatedAt: ISOString,
  };
  return putRsvp(newRsvp).then(() => ({
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

export const resolvers = { event };
export const mutations = { addRsvp, removeRsvp };
