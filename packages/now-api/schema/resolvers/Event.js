import uuid from 'uuid';

import { scan, get, put, getTemplate, getUserRsvpByEvent } from '../../db';
import { userIdFromContext } from '../util';
import { getRsvps } from './Rsvp';
import { getMessages } from './Message';

const events = () => scan('now_event');
const event = id => get('now_event', { id });
const putEvent = e => put('now_event', e);

// Resolvers
const templateResolver = root => getTemplate(root.templateId);
const rsvpsResolver = (root, args) =>
  getRsvps(root, {
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
  activity: templateResolver,
  rsvps: rsvpsResolver,
  messages: messagesResolver,
  isAttending: isAttendingResolver,
};

// Queries
const allEvents = () => events();
const eventQuery = (root, { id }) => event(id);

export const queries = { event: eventQuery, allEvents };

const createEvent = (root, { input: { time, templateId } }) => {
  const newId = uuid.v1();
  const ISOString = new Date().toISOString();
  return getTemplate(templateId)
    .then(t => ({
      id: newId,
      limit: t.limit,
      templateId,
      createdAt: ISOString,
      updatedAt: ISOString,
      rsvps: [],
      time,
    }))
    .then(putEvent)
    .then(() => ({ event: event(newId) }));
};

export const mutations = {
  createEvent,
};
