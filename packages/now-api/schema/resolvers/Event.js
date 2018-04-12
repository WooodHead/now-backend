import { ChronoUnit, Instant, ZonedDateTime } from 'js-joda';
import uuid from 'uuid';

import { scan, getEvent, put, getActivity, getUserRsvpByEvent } from '../../db';
import { userIdFromContext } from '../util';
import { getEventRsvps } from './Rsvp';
import { getMessages } from './Message';
import { TABLES } from '../../db/constants';

const events = () => scan(TABLES.EVENT);
const putEvent = e => put(TABLES.EVENT, e);

// Resolvers
const activityResolver = ({ activityId }) => getActivity(activityId);

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
  getUserRsvpByEvent(userId || userIdFromContext(ctx), id).then(
    item => item !== undefined && item.action === 'add'
  );

// one day, this will be fancier.
const stateResolver = ({ time }) => {
  const eventTime = ZonedDateTime.parse(time).toInstant();
  const now = Instant.now();

  if (now.isBefore(eventTime))
    return 'FUTURE';
  else if (eventTime.until(now, ChronoUnit.HOURS) < 2)
    return 'PRESENT';
  return 'PAST';
};

export const resolvers = {
  activity: activityResolver,
  rsvps: rsvpsResolver,
  messages: messagesResolver,
  isAttending: isAttendingResolver,
  state: stateResolver,
};

// Queries
const allEvents = () => events();
const eventQuery = (root, { id }) => getEvent(id);

export const queries = { event: eventQuery, allEvents };

const createEvent = (
  root,
  { input: { time, activityId, limit, location } }
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

  return putEvent(newEvent).then(() => ({ event: getEvent(newId) }));
};

export const mutations = {
  createEvent,
};
