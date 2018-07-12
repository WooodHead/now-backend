exports.up = knex =>
  knex.schema.table('invitations', table => {
    table.uuid('eventId');
  });

exports.down = knex =>
  knex.schema.table('invitations', table => {
    table.dropColumn('eventId');
  });
