exports.up = knex =>
  knex.schema.createTable('submissions', t => {
    t.uuid('id')
      .notNullable()
      .primary();
    t.uuid('userId');
    t.uuid('templateId');
    t.jsonb('submissionData');
    t.timestamp('createdAt').defaultTo(knex.fn.now());
    t.timestamp('updatedAt').defaultTo(knex.fn.now());
  });

exports.down = knex => knex.schema.dropTable('submissions');
