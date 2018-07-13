exports.up = knex =>
  knex.schema.table('rsvps', table => {
    table.dropUnique(['userId', 'eventId']);
    table.uuid('inviteId').nullable();
    table.unique(['userId', 'eventId', 'inviteId']);
  });

exports.down = knex =>
  knex.schema.table('rsvps', table => {
    table.dropUnique(['userId', 'eventId', 'inviteId']);
    table.unique(['eventId', 'userId']);
    table.dropColumn('inviteId');
  });
