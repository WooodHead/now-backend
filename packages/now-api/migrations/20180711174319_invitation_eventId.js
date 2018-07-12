exports.up = knex =>
  knex.schema.table('invitations', table => {
    table.text('message');
  });

exports.down = knex =>
  knex.schema.table('invitations', table => {
    table.dropColumn('message');
  });
