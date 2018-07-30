exports.up = knex =>
  knex.schema.table('invitations', table => {
    table.dropIndex(['code']);
    table.unique(['code']);
  });

exports.down = knex =>
  knex.schema.table('invitations', table => {
    table.dropUnique(['code']);
    table.index(['code']);
  });
