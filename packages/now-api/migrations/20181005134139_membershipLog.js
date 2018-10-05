exports.up = knex =>
  knex.schema.createTable('membershipLog', table => {
    table.increments();
    table.uuid('userId').index();
    table.uuid('communityId').index();
    table.string('action');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
  });

exports.down = knex => knex.schema.dropTable('membershipLog');
