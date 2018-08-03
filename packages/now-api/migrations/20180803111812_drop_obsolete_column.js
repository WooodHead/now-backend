exports.up = knex =>
  knex.schema.table('rsvps', t => {
    t.dropColumn('lastReadTs');
  });

exports.down = knex =>
  knex.schema.table('rsvps', t => {
    t.bigInteger('lastReadTs');
  });
