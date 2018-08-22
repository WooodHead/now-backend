import { ChronoUnit, Instant, ZoneId, LocalDateTime } from 'js-joda';
import uuid from 'uuid/v4';
import { toNumber, isInteger } from 'lodash';

import { userIdFromContext, sqlPaginatify } from '../util';
import { getEventRsvps, userDidRsvp } from './Rsvp';
import { NYC_TZ } from './Activity';
import { EARLY_AVAILABILITY_HOUR } from '../../db/constants';
import { getMessages, notifyMessagesRead } from './Message';
import { getPubSub } from '../../subscriptions';
import { Event, EventUserMetadata, Rsvp, Invitation } from '../../db/repos';
import sql from '../../db/sql';

const topicName = eventId => `event-changes-${eventId}`;

export const notifyEventChange = eventId =>
  getPubSub().publish(topicName(eventId), true);

export const hasInvitedToEvent = async (eventId, inviterId) => {
  const invitation = await Invitation.all({
    eventId,
    inviterId,
    active: true,
  });
  return invitation.length !== 0;
};

export const inviteHasBeenAccepted = async (eventId, inviterId) => {
  const invitations = await Invitation.all({
    eventId,
    inviterId,
    active: true,
  });

  return (
    invitations.filter(invitation => invitation.inviteeId !== null).length !== 0
  );
};

// Resolvers
const activityResolver = ({ activityId }, args, { loaders }) =>
  loaders.activities.load(activityId);

const rsvpsResolver = (root, args) =>
  getEventRsvps({
    eventId: root.id,
    ...args,
  });

const messagesResolver = async (root, args) => {
  const eventId = root.id;

  const eventMessageConnection = await getMessages(root, {
    eventId,
    ...args,
  });

  return { eventId, ...eventMessageConnection };
};

const isAttendingResolver = ({ id }, { userId }, ctx) =>
  userDidRsvp({ eventId: id, userId: userId || userIdFromContext(ctx) });

const hasInvitedResolver = async ({ id }, { userId }, ctx) =>
  hasInvitedToEvent(id, userId || userIdFromContext(ctx));

const inviteHasBeenAcceptedResolver = async ({ id }, { userId }, ctx) =>
  inviteHasBeenAccepted(id, userId || userIdFromContext(ctx));

// one day, this will be fancier.
const stateResolver = ({ time }) => {
  const eventTime = time.toInstant();
  const now = Instant.now();

  if (now.isBefore(eventTime)) return 'FUTURE';
  else if (eventTime.until(now, ChronoUnit.HOURS) < 2) return 'PRESENT';
  return 'PAST';
};

const locationResolver = ({ locationId }, args, { loaders }) =>
  loaders.locations.load(locationId);

const timeResolver = ({ time, timezone }) =>
  time
    .withZoneSameInstant(ZoneId.of(timezone))
    .truncatedTo(ChronoUnit.SECONDS)
    .withFixedOffsetZone();

export const resolvers = {
  activity: activityResolver,
  rsvps: rsvpsResolver,
  messages: messagesResolver,
  isAttending: isAttendingResolver,
  hasInvited: hasInvitedResolver,
  inviteHasBeenAccepted: inviteHasBeenAcceptedResolver,
  state: stateResolver,
  location: locationResolver,
  time: timeResolver,
};

export const visibleEventsQuery = includePast => {
  const now = LocalDateTime.now(NYC_TZ);
  const today = now.toLocalDate();

  const todayEarlyAvailable = today.atTime(EARLY_AVAILABILITY_HOUR);

  const todayStart = today.atStartOfDay();
  const tomorrowStart = today.plusDays(1).atStartOfDay();

  const todayEnd = today.plusDays(1).atStartOfDay();

  const tomorrowEnd = today.plusDays(2).atStartOfDay();
  const query = Event.all();

  if (!includePast) {
    if (now.isBefore(todayEarlyAvailable)) {
      query.where('time', '<', todayEnd.toString());
      query.where('time', '>=', todayStart.toString());
    } else {
      query.where('time', '<', tomorrowEnd.toString());
      query.where('time', '>=', tomorrowStart.toString());
    }
  }
  query.where('visibleAt', '<', Instant.now().toString());
  query.whereNotNull('visibleAt');

  return query;
};

// Queries
const allEvents = (root, { input, orderBy = 'id' }) =>
  sqlPaginatify(orderBy, Event.all({}), input);

const manyEvents = (root, { ids }, { loaders }) => loaders.events.loadMany(ids);

const eventQuery = (root, { id }, { loaders }) => loaders.events.load(id);

const eventsQuery = (root, { input, orderBy = 'time', includePast = false }) =>
  sqlPaginatify(orderBy, visibleEventsQuery(includePast), input);

export const queries = {
  event: eventQuery,
  allEvents,
  manyEvents,
  events: eventsQuery,
};

const createEvent = (
  root,
  {
    input: {
      time,
      timezone,
      duration,
      visibleAt,
      activityId,
      limit,
      locationId,
    },
  },
  { loaders }
) => {
  const newId = uuid();
  const newEvent = {
    id: newId,
    locationId,
    activityId,
    limit,
    time: time.toString(),
    timezone: timezone.id(),
    duration,
    visibleAt: visibleAt ? visibleAt.toString() : null,
    createdAt: sql.raw('now()'),
    updatedAt: sql.raw('now()'),
  };

  loaders.events.clear(newId);

  return Event.insert(newEvent).then(() => ({
    event: loaders.events.load(newId),
  }));
};

const updateEvent = (
  root,
  {
    input: {
      id,
      time,
      timezone,
      duration,
      visibleAt,
      activityId,
      limit,
      locationId,
    },
  },
  { loaders }
) => {
  const updatedEvent = {
    id,
    locationId,
    activityId,
    limit,
    time: time.toString(),
    timezone: timezone.id(),
    duration,
    visibleAt: visibleAt ? visibleAt.toString() : null,
    createdAt: sql.raw('now()'),
    updatedAt: sql.raw('now()'),
  };

  loaders.events.clear(id);

  return Event.update(updatedEvent).then(() => {
    notifyEventChange(id);
    return {
      event: loaders.events.load(id),
    };
  });
};

const markEventChatRead = async (root, { input: { eventId, ts } }, ctx) => {
  if (!isInteger(toNumber(ts))) {
    throw new Error('ts must be an integer as a string');
  }
  const userId = userIdFromContext(ctx);
  const potentialMetadata = await EventUserMetadata.get({ eventId, userId });
  let metadata = potentialMetadata;
  if (!metadata) {
    metadata = {
      id: uuid(),
      eventId,
      userId,
      createdAt: sql.raw('now()'),
    };
    await EventUserMetadata.insert(metadata);
  }

  const { id } = metadata;

  const updatedMetadata = {
    id,
    lastReadTs: ts,
    updatedAt: sql.raw('now()'),
  };

  ctx.loaders.events.clear(eventId);

  return EventUserMetadata.update(updatedMetadata).then(() => {
    notifyMessagesRead(userId, eventId);

    return {
      rsvp: () => Rsvp.get({ eventId, userId }),
      event: () => ctx.loaders.events.load(eventId),
    };
  });
};

export const mutations = {
  createEvent,
  updateEvent,
  markEventChatRead,
};

const eventSubscription = {
  subscribe: (root, { id }) => getPubSub().asyncIterator(topicName(id)),
  resolve: (payload, { id }, { loaders }) => loaders.events.load(id),
};

export const subscriptions = { event: eventSubscription };
