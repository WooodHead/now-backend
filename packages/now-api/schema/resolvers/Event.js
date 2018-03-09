import uuid from 'uuid';

import { scan, get, put, getTemplate } from '../../db';
import { getRsvps } from './Rsvp';

const events = () => scan('now_event');
const event = id => get('now_event', { id });
const putEvent = e => put('now_event', e);

// Resolvers
const templateResolver = root => getTemplate(root.templateId);
const rsvpsResolver = root =>
  getRsvps(root, {
    eventId: root.id,
    first: undefined,
    last: 20,
    after: undefined,
    before: undefined,
  });

export const resolvers = {
  activity: templateResolver,
  rsvps: rsvpsResolver,
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
