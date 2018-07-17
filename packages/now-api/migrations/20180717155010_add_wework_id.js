exports.up = knex =>
  knex.schema.table('locations', table => {
    table
      .string('weworkId')
      .nullable()
      .index();
  });

exports.down = knex =>
  knex.schema.table('locations', table => {
    table.dropColumn('weworkId');
  });
