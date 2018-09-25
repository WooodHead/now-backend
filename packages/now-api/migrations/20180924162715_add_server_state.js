exports.up = knex =>
  knex.schema.createTable('serverState', t => {
    t.increments();
    t.string('key').notNullable();
    t.text('value');
    t.timestamp('createdAt').defaultTo(knex.fn.now());
    t.timestamp('updatedAt').defaultTo(knex.fn.now());
    t.unique('key');
  });

exports.down = knex => knex.schema.dropTable('serverState');
