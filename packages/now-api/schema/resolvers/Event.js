import { values, toPairs } from 'lodash';

import db from './db';

export const attendeeCount = root =>
  db
    .rawEvent(root.id)
    .then(event => values(event.inorout).filter(s => s === 'in').length);

export const activity = root => db.activity(root.slug);

export const attendees = root =>
  db.rawEvent(root.id).then(event =>
    toPairs(event.inorout)
      .filter(([, status]) => status === 'in')
      .map(([slackId]) => ({ slackId }))
  );

export const reminders = root =>
  db.rawEvent(root.id).then(event => [
    {
      type: 'oneHour',
      sent: !!event.reminder,
    },
    {
      type: 'tenMinutes',
      sent: !!event.reminder_ten,
    },
  ]);
