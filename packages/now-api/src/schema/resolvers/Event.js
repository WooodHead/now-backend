import { ChronoUnit, Instant, ZonedDateTime } from 'js-joda';
import uuid from 'uuid';

import { userIdFromContext } from '../util';
import { getEventRsvps, userDidRsvp } from './Rsvp';
import { getMessages } from './Message';
import { getPubSub } from '../../subscriptions';
import { Event, Location } from '../../db/repos';

// Resolvers
const activityResolver = ({ activityId }, args, { loaders }) =>
  loaders.activities.load(activityId);

const rsvpsResolver = (root, args) =>
  getEventRsvps({
    eventId: root.id,
    ...args,
  });

const messagesResolver = (root, args) =>
  getMessages(root, {
    eventId: root.id,
    ...args,
  });

const isAttendingResolver = ({ id }, { userId }, ctx) =>
  userDidRsvp({ eventId: id, userId: userId || userIdFromContext(ctx) });

// one day, this will be fancier.
const stateResolver = ({ time }) => {
  const eventTime = ZonedDateTime.parse(time.toISOString()).toInstant();
  const now = Instant.now();

  if (now.isBefore(eventTime)) return 'FUTURE';
  else if (eventTime.until(now, ChronoUnit.HOURS) < 2) return 'PRESENT';
  return 'PAST';
};

const locationResolver = ({ locationId }) => Location.byId(locationId);

export const resolvers = {
  activity: activityResolver,
  rsvps: rsvpsResolver,
  messages: messagesResolver,
  isAttending: isAttendingResolver,
  state: stateResolver,
  location: locationResolver,
};

// Queries
const allEvents = () => Event.all();
const eventQuery = (root, { id }, { loaders }) => loaders.events.load(id);

export const queries = { event: eventQuery, allEvents };

const createEvent = (
  root,
  { input: { time, activityId, limit, location } },
  { loaders }
) => {
  const newId = uuid.v1();
  const ISOString = new Date().toISOString();
  const newEvent = {
    id: newId,
    limit,
    activityId,
    createdAt: ISOString,
    updatedAt: ISOString,
    rsvps: [],
    time: time.toISOString(),
    location,
  };

  loaders.events.clear(newId);

  return Event.update(newEvent).then(() => ({
    event: loaders.events.load(newId),
  }));
};

export const mutations = {
  createEvent,
};

const topicName = eventId => `event-changes-${eventId}`;

export const notifyEventChange = eventId =>
  getPubSub().publish(topicName(eventId), true);

const eventSubscription = {
  subscribe: (root, { id }) => getPubSub().asyncIterator(topicName(id)),
  resolve: (payload, { id }, { loaders }) => loaders.events(id),
};

export const subscriptions = { event: eventSubscription };
