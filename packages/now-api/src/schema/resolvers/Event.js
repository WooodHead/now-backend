import { ChronoUnit, Instant, ZoneId } from 'js-joda';
import uuid from 'uuid/v4';
import { toNumber, isInteger } from 'lodash';

import { userIdFromContext, sqlPaginatify } from '../util';
import { getEventRsvps, userDidRsvp } from './Rsvp';
import { getMessages } from './Message';
import { getPubSub } from '../../subscriptions';
import { Event, EventUserMetadata, Rsvp } from '../../db/repos';
import sql from '../../db/sql';

const topicName = eventId => `event-changes-${eventId}`;

export const notifyEventChange = eventId =>
  getPubSub().publish(topicName(eventId), true);

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
  state: stateResolver,
  location: locationResolver,
  time: timeResolver,
};

// Queries
const allEvents = (root, { input, orderBy = 'id' }) =>
  sqlPaginatify(orderBy, Event.all({}), input);

const manyEvents = (root, { ids }, { loaders }) => loaders.events.loadMany(ids);

const eventQuery = (root, { id }, { loaders }) => loaders.events.load(id);

export const queries = { event: eventQuery, allEvents, manyEvents };

const createEvent = (
  root,
  { input: { time, timezone, activityId, limit, locationId } },
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
  { input: { id, time, timezone, activityId, limit, locationId } },
  { loaders }
) => {
  const updatedEvent = {
    id,
    locationId,
    activityId,
    limit,
    time: time.toString(),
    timezone: timezone.id(),
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

  return EventUserMetadata.update(updatedMetadata).then(() => ({
    rsvp: () => Rsvp.get({ eventId, userId }),
    event: () => ctx.loaders.events.load(eventId),
  }));
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
