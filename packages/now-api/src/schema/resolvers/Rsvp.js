import uuid from 'uuid/v4';

import { userIdFromContext, sqlPaginatify } from '../util';
import { Event, Rsvp, RsvpLog, Invitation } from '../../db/repos';
import sql from '../../db/sql';
import { userQuery } from './User';
import { notifyEventChange, visibleEventsQuery } from './Event';

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
  const query = ignoreVisible ? Event.get : visibleEventsQuery;
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

const addRsvp = (root, { input: { eventId } }, ctx) =>
  sql
    .transaction(trx =>
      createRsvp(
        trx,
        { eventId, userId: userIdFromContext(ctx) },
        'add',
        ctx.loaders
      )
    )
    .then(postRsvp(eventId, ctx));

const removeRsvp = (root, { input: { eventId } }, ctx) =>
  sql
    .transaction(async trx => {
      const userId = userIdFromContext(ctx);
      const rsvpId = await createRsvp(
        trx,
        { eventId, userId },
        'remove',
        ctx.loaders
      );

      const inviteRsvpData = await Invitation.get({
        'invitations.eventId': eventId,
        inviterId: userId,
        active: true,
      })
        .innerJoin('rsvps', 'invitations.id', 'rsvps.inviteId')
        .select('inviteId', 'inviteeId');

      if (inviteRsvpData) {
        const { inviteId } = inviteRsvpData;
        if (!inviteRsvpData.inviteeId) {
          // If the invitee has not accepted we burn the RSVP. We don't burn
          // the RSVP if the invitee HAS accepted because it'd kick them out.
          await createRsvp(
            trx,
            { eventId, inviteId },
            'inviter-left',
            ctx.loaders
          );
        }
        // Whether or not the invitee accepted, flag the invitation as not
        // active. Do this so the inviter can rejoin during the invite window.
        await Invitation.update({ id: inviteId, active: false });
      }

      return rsvpId;
    })
    .then(postRsvp(eventId, ctx));

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
