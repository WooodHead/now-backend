import uuid from 'uuid/v4';

import { userIdFromContext, sqlPaginatify, buildEdge } from '../util';
import { Event, Rsvp, RsvpLog } from '../../db/repos';
import sql from '../../db/sql';
import { userQuery } from './User';
import { notifyEventChange, joinableEventsQuery } from './Event';
import { notifyUserMessageCountChanged } from './Message';
import { isAdmin } from '../AdminDirective';

const event = ({ eventId }, args, { loaders }) => loaders.events.load(eventId);
const invite = ({ inviteId }, args, { loaders }) =>
  inviteId ? loaders.invitations.load(inviteId) : null;

const user = (rsvp, args, context) =>
  userQuery(rsvp, { id: rsvp.userId }, context);

const computeGoingClause = (action, previousRsvp) => {
  if (previousRsvp && action === previousRsvp.action) {
    return null;
  }
  return action === 'add'
    ? sql.raw('?? + 1', 'going')
    : sql.raw('greatest(?? - 1, 0)', 'going');
};

export const createRsvp = async (
  trx,
  { eventId, userId, inviteId, host = false, ignoreConstraints = false },
  action,
  loaders
) => {
  const query = ignoreConstraints ? Event.get : joinableEventsQuery;
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
  if (
    previousRsvp &&
    previousRsvp.action === action &&
    previousRsvp.host === host
  ) {
    return previousRsvp.id;
  }

  if (
    !ignoreConstraints &&
    rsvpEvent.going >= rsvpEvent.limit &&
    action === 'add' &&
    (!previousRsvp || previousRsvp.action !== 'add')
  ) {
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
      host,
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
      host,
      createdAt: ISOString,
      updatedAt: ISOString,
    };
    rsvpCall = Rsvp.insert(newRsvp);
  }

  const going = computeGoingClause(action, previousRsvp);

  const actions = [];
  actions.push(rsvpCall.transacting(trx));
  actions.push(
    RsvpLog.insert({ eventId, userId, action, host }).transacting(trx)
  );
  if (going) {
    actions.push(
      Event.byId(eventId)
        .transacting(trx)
        .update({ going })
    );
  }
  await Promise.all(actions);

  return id;
};

const postRsvp = (eventId, userId, ctx) => id => {
  notifyEventChange(eventId);
  notifyUserMessageCountChanged(userId);

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

const shouldIgnoreConstraints = (inputUserId, ctx) =>
  isAdmin(ctx) && !!inputUserId;

const mutateRsvp = (
  action,
  { input: { eventId, userId: inputUserId, host = false } },
  ctx
) => {
  const userId = getUserIdForRsvp(inputUserId, ctx);
  const ignoreConstraints = shouldIgnoreConstraints(inputUserId, ctx);
  if (!ignoreConstraints && host) {
    throw new Error('You are not authorized to set this RSVP as a host.');
  }
  return sql
    .transaction(trx =>
      createRsvp(
        trx,
        { eventId, userId, host, ignoreConstraints },
        action,
        ctx.loaders
      )
    )
    .then(postRsvp(eventId, userId, ctx));
};

const addRsvp = (root, args, ctx) => mutateRsvp('add', args, ctx);

const removeRsvp = (root, args, ctx) => mutateRsvp('remove', args, ctx);

export const resolvers = { event, user, invite };
export const mutations = { addRsvp, removeRsvp };

export const getEventRsvps = async ({
  eventId,
  first,
  last,
  after,
  before,
  loggedInUserId,
}) => {
  let loggedInUserRsvp;
  const rsvpQuery = Rsvp.all({ action: 'add', eventId }).where(builder => {
    builder.whereNot('userId', loggedInUserId);
    builder.orWhereNull('userId');
  });
  if (loggedInUserId && !after && !before) {
    loggedInUserRsvp = await Rsvp.get({
      userId: loggedInUserId,
      eventId,
      action: 'add',
    });
  }

  const rsvps = sqlPaginatify('id', rsvpQuery, {
    first,
    last,
    after,
    before,
  });

  if (loggedInUserRsvp) {
    return rsvps.then(({ pageInfo, count, edges }) => ({
      pageInfo,
      count: count().then(result => result + 1),
      edges: edges().then(rsvpsEdges => [
        buildEdge('id', loggedInUserRsvp),
        ...rsvpsEdges,
      ]),
    }));
  }

  return rsvps;
};

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
