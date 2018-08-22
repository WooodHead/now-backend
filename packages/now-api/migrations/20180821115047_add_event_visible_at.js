exports.up = knex =>
  knex.schema.table('events', table => {
    table.timestamp('visibleAt');
    table.index(['visibleAt']);
  });

exports.down = knex =>
  knex.schema.table('events', table => {
    table.dropColumn('visibleAt');
    table.dropIndex(['visibleAt']);
  });
