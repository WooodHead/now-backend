exports.up = knex =>
  knex.schema
    .table('invitations', table => {
      table.boolean('active').defaultTo(true);
    })
    .then(() =>
      knex.raw(
        'CREATE UNIQUE INDEX one_active_invite ON invitations ("inviterId", "eventId") WHERE ("active" = true);'
      )
    );

exports.down = knex =>
  knex.schema
    .table('invitations', table => {
      table.dropColumn('active');
    })
    .then(() => knex.raw('DROP INDEX one_active_invite'));
