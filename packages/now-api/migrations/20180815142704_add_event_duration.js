exports.up = knex =>
  knex.schema.table('events', table => {
    table.integer('duration').defaultTo(60);
  });

exports.down = knex => knex.schema.table('events').dropColumn('duration');
