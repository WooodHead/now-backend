exports.up = knex =>
  knex.schema.table('users', table => {
    table.string('meetupId').unique();
  });

exports.down = knex =>
  knex.schema.table('users', table => {
    table.dropColumn('meetupId');
  });
