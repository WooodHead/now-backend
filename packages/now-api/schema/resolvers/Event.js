const { values, toPairs } = require('lodash');
const db = require('./db');

module.exports = {
  attendeeCount(root) {
    return db
      .rawEvent(root.id)
      .then(event => values(event.inorout).filter(s => s === 'in').length);
  },
  activity(root) {
    return db.activity(root.slug);
  },
  attendees(root) {
    return db.rawEvent(root.id).then(event =>
      toPairs(event.inorout)
        .filter(([, status]) => status === 'in')
        .map(([slackId]) => ({ slackId }))
    );
  },
  reminders(root) {
    return db.rawEvent(root.id).then(event => [
      {
        type: 'oneHour',
        sent: !!event.reminder,
      },
      {
        type: 'tenMinutes',
        sent: !!event.reminder_ten,
      },
    ]);
  },
};
