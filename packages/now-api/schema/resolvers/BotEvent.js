import { values, toPairs } from 'lodash';
import uuid from 'uuid';

import { scan, get, update, put } from '../../db';
import { parseDate } from '../../db/util';
import { activity } from './Activity';

const REMINDER_TYPE = {
  ONE_HOUR: 'oneHour',
  TEN_MINUTES: 'tenMinutes',
};
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
      type: REMINDER_TYPE.ONE_HOUR,
      sent: !!e.reminder,
    },
    {
      type: REMINDER_TYPE.TEN_MINUTES,
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
const allBotEvents = () => events();
const eventQuery = (root, { id }) => event(id);

export const queries = { botEvent: eventQuery, allBotEvents };

const createBotEvent = (
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
    .then(() => ({ botEvent: event(newId) }));
};

const addUserToBotEvent = (root, { input: { botEventId, slackId } }) =>
  rawEvent(botEventId)
    .then(e => ({ ...(e.inorout || {}), [slackId]: 'in' }))
    .then(inorout =>
      update(
        'now',
        { id: botEventId },
        'SET inorout = :inorout, updatedAt = :updatedAt',
        {
          ':updatedAt': Date.now(),
          ':inorout': inorout,
        }
      )
    )
    .then(() => ({ botEvent: event(botEventId) }));

const setBotEventReminderSent = (root, { input: { botEventId, type } }) => {
  let expr = '';
  switch (type) {
    case REMINDER_TYPE.ONE_HOUR:
      expr = 'SET reminder = :true, updatedAt = :updatedAt';
      break;
    case REMINDER_TYPE.TEN_MINUTES:
      expr = 'SET reminder_ten = :true, updatedAt = :updatedAt';
      break;
    default:
      throw new Error(`Unknown reminder type ${type}`);
  }
  return update('now', { id: botEventId }, expr, {
    ':updatedAt': Date.now(),
    ':true': true,
  }).then(() => ({ botEvent: event(botEventId) }));
};

export const mutations = {
  createBotEvent,
  addUserToBotEvent,
  setBotEventReminderSent,
};
