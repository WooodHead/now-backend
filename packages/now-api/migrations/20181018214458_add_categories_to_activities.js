exports.up = knex =>
  knex.schema.table('activities', table => {
    table.uuid('categoryId');
  });

exports.down = knex =>
  knex.schema.table('activities', table => {
    table.dropColumn('categoryId');
  });
