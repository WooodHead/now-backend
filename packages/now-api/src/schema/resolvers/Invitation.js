/* eslint-disable no-await-in-loop */
import { ZonedDateTime } from 'js-joda';
import leftPad from 'left-pad';
import randomNumber from 'random-number-csprng';
import uuid from 'uuid/v4';

import { Invitation } from '../../db/repos';
import { userQuery } from './User';
import { sqlPaginatify, userIdFromContext } from '../util';

const MAX_CODE_RETRIES = 6;

// given a partial knex query, add some WHERE clauses to make sure the token
// is currently redeemable
const valid = builder =>
  builder
    .whereNull('usedAt')
    .whereRaw('(?? >= now() or ?? is null)', ['expiresAt', 'expiresAt']);

export const findValidCode = (code, ...fields) =>
  valid(Invitation.all({ code })).first(...fields);

const resolveType = ({ type }) => type;

const resolveInviter = (invitation, args, context) =>
  userQuery(invitation, { id: invitation.inviterId }, context);

export const resolvers = {
  __resolveType: resolveType,
  inviter: resolveInviter,
};

const invitationQuery = (root, { code }) => findValidCode(code);

const openAppInvitations = (root, { input }) => {
  const { orderBy = 'id', ...pageParams } = input || {};
  return sqlPaginatify(
    orderBy,
    valid(Invitation.all({ type: 'AppInvitation' })),
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
    type: 'AppInvitation',
    inviterId: userIdFromContext(context),
    expiresAt: (expiresAt || ZonedDateTime.now().plusWeeks(1))
      .toInstant()
      .toString(),
    notes,
  };
  await Invitation.insert(newInvitation);
  return {
    invitation: Invitation.byId(id),
  };
};

export const consumeInvitation = (id, trx) =>
  valid(Invitation.withTransaction(trx).all({ id }))
    .update({
      usedAt: trx.raw('now()'),
      updatedAt: trx.raw('now()'),
    })
    .then(
      count =>
        count === 1
          ? Promise.resolve()
          : Promise.reject(new Error('Invalid invitation'))
    );

export const mutations = { createAppInvitation };
