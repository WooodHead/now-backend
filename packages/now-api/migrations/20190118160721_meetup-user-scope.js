exports.up = knex =>
  knex.schema.table('users', table => {
    table.string('scope');
  });

exports.down = knex =>
  knex.schema.table('users', table => {
    table.dropColumn('scope');
  });
