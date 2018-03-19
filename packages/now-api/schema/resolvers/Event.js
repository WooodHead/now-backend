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

export const resolvers = {
  activity: activityResolver,
  rsvps: rsvpsResolver,
  messages: messagesResolver,
  isAttending: isAttendingResolver,
};

// Queries
const allEvents = () => events();
const eventQuery = (root, { id }) => getEvent(id);

export const queries = { event: eventQuery, allEvents };

const createEvent = (root, { input: { time, activityId } }) => {
  const newId = uuid.v1();
  const ISOString = new Date().toISOString();
  return getActivity(activityId)
    .then(t => ({
      id: newId,
      limit: t.limit,
      activityId,
      createdAt: ISOString,
      updatedAt: ISOString,
      rsvps: [],
      time,
    }))
    .then(putEvent)
    .then(() => ({ event: getEvent(newId) }));
};

export const mutations = {
  createEvent,
};
