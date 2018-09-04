/* eslint-disable no-await-in-loop */
import { ZonedDateTime, LocalDate } from 'js-joda';
import leftPad from 'left-pad';
import randomNumber from 'random-number-csprng';
import uuid from 'uuid/v4';

import sql from '../../db/sql';
import { Invitation } from '../../db/repos';
import { userQuery } from './User';
import { sqlPaginatify, userIdFromContext } from '../util';
import { joinableEventsQuery } from './Event';
import { NYC_TZ } from './Activity';
import { AVAILABILITY_HOUR } from '../../db/constants';

const MAX_CODE_RETRIES = 6;

export const APP_INVITE_TYPE = 'AppInvitation';
export const EVENT_INVITE_TYPE = 'EventInvitation';

// given a partial knex query, add some WHERE clauses to make sure the token
// is currently redeemable
const valid = builder =>
  builder.whereRaw('(?? >= now() or ?? is null)', ['expiresAt', 'expiresAt']);

export const findValidCode = (code, trx, ...fields) =>
  valid(Invitation.withTransaction(trx).all({ code })).first(...fields);

const resolveType = ({ type }) => type;

const resolveInviter = (invitation, args, context) =>
  userQuery(invitation, { id: invitation.inviterId }, context);

const resolveEvent = ({ eventId }, args, { loaders }) =>
  loaders.events.load(eventId);

export const resolvers = {
  __resolveType: resolveType,
  inviter: resolveInviter,
  event: resolveEvent,
};

const invitationQuery = (root, { code, id, eventId }, ctx) => {
  if (code) {
    return findValidCode(code).then(
      candidate => (id && candidate.id !== id ? null : candidate)
    );
  }
  if (id) {
    return Invitation.byId(id);
  }
  if (eventId) {
    const userId = userIdFromContext(ctx);
    return Invitation.get({ eventId, inviterId: userId, active: true });
  }
  return null;
};

const openAppInvitations = (root, { input }) => {
  const { orderBy = 'id', ...pageParams } = input || {};
  return sqlPaginatify(
    orderBy,
    valid(Invitation.all({ type: APP_INVITE_TYPE })),
    pageParams
  );
};

const checkInvitation = async (root, { code }) => {
  const now = ZonedDateTime.now(NYC_TZ);
  const invite = await Invitation.get({ code });
  if (!invite) {
    throw new Error('Invite not found.');
  }
  if (invite.expiresAt) {
    if (invite.expiresAt.isBefore(now)) {
      throw new Error('This invite has expired.');
    }
  }

  return {
    code,
    eventId: invite.eventId,
    type: invite.type,
  };
};

export const queries = {
  invitation: invitationQuery,
  openAppInvitations,
  checkInvitation,
};

// regex which matches a string with all the same character, like 444444
const allTheSame = /^(.)\1*$/;

export const generateCode = async trx => {
  for (let i = 0; i < MAX_CODE_RETRIES; i += 1) {
    const num = await randomNumber(0, 999999);
    const trialCode = leftPad(String(num), 6, '0');
    const existing = await Invitation.withTransaction(trx).get({
      code: trialCode,
    });
    if (!existing && !allTheSame.test(trialCode)) {
      return trialCode;
    }
  }
  throw new Error("Couldn't generate code.");
};

const createEventInvitation = async (root, { input: { eventId } }, context) =>
  sql.transaction(async trx => {
    const event = await joinableEventsQuery()
      .where({ id: eventId })
      .transacting(trx)
      .forUpdate()
      .first();

    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    const inviterId = userIdFromContext(context);

    if (event.limit - event.going < 1) {
      throw new Error("Sorry, there aren't enough spots left now");
    }

    const previousInvite = await Invitation.get({
      eventId,
      inviterId,
      active: true,
    });

    if (previousInvite) {
      return { invitation: previousInvite };
    }

    const id = uuid();
    const code = await generateCode();
    const expiresAt =
      event.time ||
      LocalDate.now(NYC_TZ)
        .atTime(AVAILABILITY_HOUR)
        .atZone(NYC_TZ)
        .toInstant()
        .toString();

    const newInvitation = {
      id,
      code,
      type: EVENT_INVITE_TYPE,
      inviterId,
      eventId,
      notes: '',
      expiresAt,
      message: `Hey, I invited you to join tomorrow’s Meetup of the Day with me! You just have to get the app here: https://now.meetup.com/i and use this invite code: ${code}.`,
    };

    await Invitation.insert(newInvitation).transacting(trx);
    const invitation = await Invitation.byId(id).transacting(trx);
    return {
      invitation,
    };
  });

const makeAppInvitation = async (trx, expiresAt, inviterId, notes) => {
  const id = uuid();
  const code = await generateCode();
  const newInvitation = {
    id,
    code,
    type: APP_INVITE_TYPE,
    inviterId,
    expiresAt: (expiresAt || ZonedDateTime.now().plusWeeks(1))
      .toInstant()
      .toString(),
    notes,
    eventId: null,
  };
  await Invitation.withTransaction(trx).insert(newInvitation);

  return id;
};

const createAppInvitation = (
  root,
  { input: { notes, expiresAt } },
  context
) => {
  const inviterId = userIdFromContext(context);
  return makeAppInvitation(undefined, expiresAt, inviterId, notes).then(id => ({
    invitation: Invitation.byId(id),
  }));
};

const createManyAppInvitations = (
  root,
  { input: { notes, expiresAt } },
  context
) => {
  const inviterId = userIdFromContext(context);
  return sql
    .transaction(trx =>
      Promise.all(
        notes.map(note => makeAppInvitation(trx, expiresAt, inviterId, note))
      )
    )
    .then(Invitation.batch)
    .then(invitations => ({
      invitations,
      codes: invitations.map(({ code }) => code),
    }));
};

export const consumeInvitation = (id, userId, trx) =>
  valid(Invitation.withTransaction(trx).all({ id }))
    .update({
      inviteeId: userId,
      usedAt: trx.raw('now()'),
      updatedAt: trx.raw('now()'),
    })
    .then(
      count =>
        count === 1
          ? Promise.resolve()
          : Promise.reject(new Error('Invalid invitation'))
    );

export const mutations = {
  createAppInvitation,
  createManyAppInvitations,
  createEventInvitation,
};
