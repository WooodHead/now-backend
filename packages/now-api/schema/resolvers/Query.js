const db = require('./db');

module.exports = {
  allEvents: () => db.events(),
  event: (root, { id }) => db.event(id),
};
