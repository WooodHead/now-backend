import uuid from 'uuid/v4';

import { userIdFromContext, sqlPaginatify } from '../util';
import { Event, Rsvp, RsvpLog } from '../../db/repos';
import sql from '../../db/sql';
import { userQuery } from './User';
import { notifyEventChange, joinableEventsQuery } from './Event';
import { isAdmin } from '../AdminDirective';

const event = ({ eventId }, args, { loaders }) => loaders.events.load(eventId);
const invite = ({ inviteId }, args, { loaders }) =>
  inviteId ? loaders.invitations.load(inviteId) : null;

const user = (rsvp, args, context) =>
  userQuery(rsvp, { id: rsvp.userId }, context);

export const createRsvp = async (
  trx,
  { eventId, userId, inviteId, ignoreVisible = false },
  action,
  loaders
) => {
  const query = ignoreVisible ? Event.get : joinableEventsQuery;
  const rsvpEvent = await query()
    .where({ id: eventId })
    .transacting(trx)
    .forUpdate()
    .first();

  if (!rsvpEvent) {
    throw new Error(`Event ${eventId} not found`);
  }

  let previousRsvp;
  if (userId) {
    previousRsvp = await Rsvp.get({ eventId, userId }).transacting(trx);
  } else {
    previousRsvp = await Rsvp.get({ eventId, inviteId }).transacting(trx);
  }

  // idempotent
  if (previousRsvp && previousRsvp.action === action) {
    return previousRsvp.id;
  }

  if (rsvpEvent.going >= rsvpEvent.limit && action === 'add') {
    throw new Error(`Event ${eventId} full`);
  }

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
      inviteId,
      action,
      createdAt: ISOString,
      updatedAt: ISOString,
    };
    rsvpCall = Rsvp.insert(newRsvp);
  }

  const going =
    action === 'add' ? rsvpEvent.going + 1 : Math.max(0, rsvpEvent.going - 1);

  await Promise.all([
    rsvpCall.transacting(trx),
    RsvpLog.insert({ eventId, userId, action }).transacting(trx),
    Event.byId(eventId)
      .transacting(trx)
      .update({ going }),
  ]);

  return id;
};

const postRsvp = (eventId, ctx) => id => {
  notifyEventChange(eventId);

  return {
    rsvp: () => ctx.loaders.rsvps.load(id),
    event: () => ctx.loaders.events.load(eventId),
  };
};

const getUserIdForRsvp = (inputUserId: ?string, ctx) => {
  const myUserId = userIdFromContext(ctx);
  if (!inputUserId || inputUserId === myUserId) {
    return myUserId;
  }
  if (isAdmin(ctx)) {
    return inputUserId;
  }
  throw new Error('You can not RSVP other users.');
};

const addRsvp = (root, { input: { eventId, userId: inputUserId } }, ctx) => {
  const userId = getUserIdForRsvp(inputUserId, ctx);
  return sql
    .transaction(trx =>
      createRsvp(trx, { eventId, userId }, 'add', ctx.loaders)
    )
    .then(postRsvp(eventId, ctx));
};

const removeRsvp = (root, { input: { eventId, userId: inputUserId } }, ctx) => {
  const userId = getUserIdForRsvp(inputUserId, ctx);
  return sql
    .transaction(async trx => {
      const rsvpId = await createRsvp(
        trx,
        { eventId, userId },
        'remove',
        ctx.loaders
      );
      return rsvpId;
    })
    .then(postRsvp(eventId, ctx));
};

export const resolvers = { event, user, invite };
export const mutations = { addRsvp, removeRsvp };

export const getEventRsvps = ({ eventId, first, last, after, before }) =>
  sqlPaginatify('id', Rsvp.all({ action: 'add', eventId }), {
    first,
    last,
    after,
    before,
  });

export const getUserRsvps = ({ userId, first, last, after, before }) =>
  sqlPaginatify(
    'events.time',
    Rsvp.all({ action: 'add', userId })
      .innerJoin('events', 'events.id', 'rsvps.eventId')
      .whereNotNull('events.visibleAt'),
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
