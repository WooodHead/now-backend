exports.up = knex =>
  knex.schema.createTable('communityWhitelist', t => {
    t.increments();
    t.string('email');
    t.uuid('communityId');
    t.unique(['email', 'communityId']);
    t.timestamp('createdAt').defaultTo(knex.fn.now());
    t.timestamp('updatedAt').defaultTo(knex.fn.now());
  });

exports.down = knex => knex.schema.dropTable('communityWhitelist');
