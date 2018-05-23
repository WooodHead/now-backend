exports.up = knex =>
  knex.schema
    .table('users', table => {
      table.string('tosVersion');
    })
    .then(() => knex('users').update({ tosVersion: '8.0' }));

exports.down = knex =>
  knex.schema.table('users', table => {
    table.dropColumn('tosVersion');
  });
