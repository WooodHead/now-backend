/* eslint-disable no-await-in-loop */
import { ZonedDateTime, LocalDate, LocalDateTime } from 'js-joda';
import leftPad from 'left-pad';
import randomNumber from 'random-number-csprng';
import uuid from 'uuid/v4';

import { Invitation } from '../../db/repos';
import { userQuery } from './User';
import { sqlPaginatify, userIdFromContext } from '../util';
import { hasInvitedToEvent } from './Event';
import { EARLY_AVAILABILITY_HOUR, AVAILABILITY_HOUR, NYC_TZ } from './Activity';

const MAX_CODE_RETRIES = 6;

export const APP_INVITE_TYPE = 'AppInvitation';
export const EVENT_INVITE_TYPE = 'EventInvitation';

// given a partial knex query, add some WHERE clauses to make sure the token
// is currently redeemable
const valid = builder =>
  builder
    .whereNull('usedAt')
    .whereRaw('(?? >= now() or ?? is null)', ['expiresAt', 'expiresAt']);

export const findValidCode = (code, ...fields) =>
  valid(Invitation.all({ code })).first(...fields);

const canInviteNow = date => {
  const now = LocalDateTime.now(NYC_TZ);
  const today = now.toLocalDate();
  const tomorrowBegin = today.plusDays(1).atStartOfDay();
  const tomorrowEnd = today.plusDays(2).atStartOfDay();
  const earlyAvailabilityTime = today.atTime(EARLY_AVAILABILITY_HOUR);
  const availabilityTime = today.atTime(AVAILABILITY_HOUR);

  return (
    date.isAfter(tomorrowBegin) &&
    date.isBefore(tomorrowEnd) &&
    now.isAfter(earlyAvailabilityTime) &&
    now.isBefore(availabilityTime)
  );
};

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

const invitationQuery = (root, { code, id }) => {
  if (code) {
    return findValidCode(code).then(
      candidate => (id && candidate.id !== id ? null : candidate)
    );
  }
  if (id) {
    return Invitation.byId(id);
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

export const queries = { invitation: invitationQuery, openAppInvitations };

// regex which matches a string with all the same character, like 444444
const allTheSame = /^(.)\1*$/;

export const generateCode = async () => {
  for (let i = 0; i < MAX_CODE_RETRIES; i += 1) {
    const num = await randomNumber(0, 999999);
    const trialCode = leftPad(String(num), 6, '0');
    const existing = await findValidCode(trialCode, 'id');
    if (!existing && !allTheSame.test(trialCode)) return trialCode;
  }
  throw new Error("Couldn't generate code.");
};

const createEventInvitation = async (root, { input: { eventId } }, context) => {
  const event = await context.loaders.events.load(eventId);
  const inviterId = userIdFromContext(context);

  if (event.limit - event.going < 2) {
    throw new Error('Not enough spots!!');
  }

  if (!canInviteNow(event.time.toLocalDateTime())) {
    throw new Error("Can't invite now!!");
  }

  if (await hasInvitedToEvent(eventId, inviterId)) {
    throw new Error('Inviter already invited!!');
  }

  const id = uuid();
  const code = await generateCode();
  const expiresAt = LocalDate.now()
    .atTime(AVAILABILITY_HOUR)
    .atZone(NYC_TZ);

  const newInvitation = {
    id,
    code,
    type: EVENT_INVITE_TYPE,
    inviterId,
    eventId,
    notes: '',
    expiresAt: expiresAt.toInstant().toString(),
    message: `You've been invited to a Meetup Now! Get the app here: https://now.meetup.com/. Your invite code is ${code}`,
  };

  await Invitation.insert(newInvitation);
  const invitation = await Invitation.byId(id);

  return {
    invitation,
  };
};

const createAppInvitation = async (
  root,
  { input: { notes, expiresAt } },
  context
) => {
  const id = uuid();
  const code = await generateCode();
  const newInvitation = {
    id,
    code,
    type: APP_INVITE_TYPE,
    inviterId: userIdFromContext(context),
    expiresAt: (expiresAt || ZonedDateTime.now().plusWeeks(1))
      .toInstant()
      .toString(),
    notes,
    eventId: null,
  };
  await Invitation.insert(newInvitation);
  return {
    invitation: Invitation.byId(id),
  };
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

export const mutations = { createAppInvitation, createEventInvitation };
