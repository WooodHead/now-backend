import uuid from 'uuid/v4';

import { userIdFromContext, sqlPaginatify } from '../util';
import { Rsvp } from '../../db/repos';
import { userQuery } from './User';
import { notifyEventChange } from './Event';

const event = ({ eventId }, args, { loaders }) => loaders.events.load(eventId);

const user = (rsvp, args, context) =>
  userQuery(rsvp, { id: rsvp.userId }, context);

const createRsvp = (eventId, userId, action, loaders) =>
  Rsvp.get({ eventId, userId }).then(previousRsvp => {
    let rsvpCall;
    let id = uuid();
    const ISOString = new Date().toISOString();
    if (previousRsvp) {
      ({ id } = previousRsvp);

      const updatedRsvp = {
        id,
        action,
        updatedAt: ISOString,
      };
      rsvpCall = Rsvp.update(updatedRsvp);
      loaders.rsvps.clear(id);
    } else {
      const newRsvp = {
        id,
        eventId,
        userId,
        action,
        createdAt: ISOString,
        updatedAt: ISOString,
      };
      rsvpCall = Rsvp.insert(newRsvp);
    }
    return rsvpCall.then(() => {
      notifyEventChange(eventId);
      return {
        rsvp: loaders.rsvps.load(id),
        event: loaders.events.load(eventId),
      };
    });
  });

const addRsvp = (root, { input: { eventId } }, ctx) =>
  createRsvp(eventId, userIdFromContext(ctx), 'add', ctx.loaders);

const removeRsvp = (root, { input: { eventId } }, ctx) =>
  createRsvp(eventId, userIdFromContext(ctx), 'remove', ctx.loaders);

export const resolvers = { event, user };
export const mutations = { addRsvp, removeRsvp };

export const getEventRsvps = ({ eventId, first, last, after, before }) =>
  sqlPaginatify('userId', Rsvp.all({ action: 'add', eventId }), {
    first,
    last,
    after,
    before,
  });

export const getUserRsvps = ({ userId, first, last, after, before }) =>
  sqlPaginatify(
    'events.time',
    Rsvp.all({ action: 'add', userId }).innerJoin(
      'events',
      'events.id',
      'rsvps.eventId'
    ),
    {
      first,
      last,
      after,
      before,
      reverse: true,
      select: 'rsvps.*',
    }
  );

export const userDidRsvp = ({ eventId, userId }) =>
  Rsvp.get({ eventId, userId }).then(item => !!(item && item.action === 'add'));
