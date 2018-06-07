exports.up = knex =>
  knex.schema.table('invitations', table => {
    table.uuid('inviteeId').nullable();
  });

exports.down = knex =>
  knex.schema.table('invitations', table => {
    table.dropColumn('inviteeId');
  });
