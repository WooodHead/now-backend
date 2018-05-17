exports.up = knex =>
  knex.schema
    .createTable('users', table => {
      table.uuid('id').primary();
      table.string('auth0Id').unique();
      table.string('email');
      table.string('firstName');
      table.string('lastName');
      table.json('preferences');
      table.date('birthday');
      table.string('photoId');
      table.text('photoPreview');
      table.text('bio');
      table.string('location');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
    .createTable('devices', table => {
      table.string('token').primary();
      table.string('type');
      table.string('model');
      table.uuid('userId').index();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
    .createTable('blockedUsers', table => {
      table.uuid('blockerId').index();
      table.uuid('blockedId').index();
      table.primary(['blockerId', 'blockedId']);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });

exports.down = knex =>
  knex.schema
    .dropTable('blockedUsers')
    .dropTable('devices')
    .dropTable('users');
