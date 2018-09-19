exports.up = knex =>
  knex.schema.table('users', t => {
    t.dropColumn('birthday');
  });

exports.down = knex =>
  knex.schema.table('users', t => {
    t.date('birthday');
  });
