exports.up = knex =>
  knex.schema.createTable('invitations', t => {
    t
      .uuid('id')
      .notNullable()
      .primary();
    t
      .string('code')
      .notNullable()
      .index();
    t.string('type').notNullable();
    t.uuid('inviterId').notNullable();
    t.timestamp('expiresAt');
    t.timestamp('usedAt');
    t.text('notes');
    t
      .timestamp('createdAt')
      .notNullable()
      .defaultTo(knex.fn.now());
    t
      .timestamp('updatedAt')
      .notNullable()
      .defaultTo(knex.fn.now());
  });

exports.down = knex => knex.schema.dropTable('invitations');
