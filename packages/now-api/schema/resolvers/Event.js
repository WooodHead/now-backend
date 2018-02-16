import { values, toPairs } from 'lodash';
import uuid from 'uuid';

import { scan, get, update, put } from '../../db';
import { parseDate } from '../../db/util';
import { activity } from './Activity';

// DB Stuff
const transformEvent = event => ({
  id: event.id,
  title: event.title,
  description: event.description,
  limit: event.limit,
  slug: event.slug,
  time: parseDate(event.time),
  chatChannel: event.channel_id,
  postChannel: event.post_channel,
  duration: event.duration,
  creatorId: event.creator_id,
  createdAt: parseDate(event.createdAt),
  updatedAt: parseDate(event.updatedAt),
});
const transformEvents = events => events.map(transformEvent);
const events = () => scan('now').then(transformEvents);
const rawEvent = id => get('now', { id });
const event = id => rawEvent(id).then(transformEvent);
const putEvent = e => put('now', e);

// Resolvers
const activityResolver = root => activity(root.slug);
const attendeeCount = root =>
  rawEvent(root.id).then(e => values(e.inorout).filter(s => s === 'in').length);

const attendees = root =>
  rawEvent(root.id).then(e =>
    toPairs(e.inorout)
      .filter(([, status]) => status === 'in')
      .map(([slackId]) => ({ slackId }))
  );

const reminders = root =>
  rawEvent(root.id).then(e => [
    {
      type: 'oneHour',
      sent: !!e.reminder,
    },
    {
      type: 'tenMinutes',
      sent: !!e.reminder_ten,
    },
  ]);

export const resolvers = {
  activity: activityResolver,
  attendees,
  attendeeCount,
  reminders,
};

// Queries
const allEvents = () => events();
const eventQuery = (root, { id }) => event(id);

export const queries = { event: eventQuery, allEvents };

const createEvent = (
  root,
  { input: { activitySlug, time, postChannel, chatChannel, creatorId } }
) => {
  const newId = uuid.v1();
  return activity(activitySlug)
    .then(a => ({
      id: newId,
      slug: activitySlug,
      limit: a.limit,
      description: a.description,
      title: a.title,
      duration: a.duration,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      post_channel: postChannel,
      channel_id: chatChannel,
      inorout: {},
      time: time.getTime(),
      creator_id: creatorId,
    }))
    .then(putEvent)
    .then(() => ({ event: event(newId) }));
};

const addUserToEvent = (root, { input: { eventId, slackId } }) =>
  rawEvent(eventId)
    .then(e => ({ ...(e.inorout || {}), [slackId]: 'in' }))
    .then(inorout =>
      update(
        'now',
        { id: eventId },
        'SET inorout = :inorout, updatedAt = :updatedAt',
        {
          ':updatedAt': Date.now(),
          ':inorout': inorout,
        }
      )
    )
    .then(() => ({ event: event(eventId) }));

export const mutations = { createEvent, addUserToEvent };
