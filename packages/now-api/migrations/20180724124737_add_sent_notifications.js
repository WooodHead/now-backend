exports.up = knex =>
  knex.schema.createTable('sentNotifications', t => {
    t.uuid('id')
      .primary()
      .notNullable();
    t.uuid('referenceId').notNullable();
    t.string('key');
    t.datetime('createdAt').defaultTo(knex.raw('now()'));
    t.unique(['referenceId', 'key']);
  });

exports.down = knex => knex.schema.dropTable('sentNotifications');
