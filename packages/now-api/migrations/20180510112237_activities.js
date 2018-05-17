exports.up = knex =>
  knex.schema
    .createTable('activities', table => {
      table.uuid('id').primary();
      table.date('activityDate').index();
      table.string('title');
      table.string('emoji');
      table.text('description');
      table.text('pushNotification');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
    .createTable('locations', table => {
      table.uuid('id').primary();
      table.string('name');
      table.string('address');
      table.string('city');
      table.string('state');
      table.string('postalCode');
      table.string('crossStreet');
      table.string('country');
      table.string('neighborhood');
      table.string('foursquareVenueId').index();
      table.float('lat');
      table.float('lng');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
    .createTable('events', table => {
      table.uuid('id').primary();
      table.uuid('activityId').index();
      table.uuid('locationId');
      table.integer('limit');
      table.dateTime('time');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
    .createTable('rsvps', table => {
      table.uuid('id').primary();
      table.uuid('userId').index();
      table.uuid('eventId').index();
      table.unique(['userId', 'eventId']);
      table.bigInteger('lastReadTs');
      table.string('action');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
    .createTable('messages', table => {
      table.uuid('id').primary();
      table.bigInteger('ts');
      table.uuid('eventId');
      table.uuid('userId');
      table.text('text');
    });

exports.down = knex =>
  knex.schema
    .dropTable('messages')
    .dropTable('rsvps')
    .dropTable('events')
    .dropTable('locations')
    .dropTable('activities');
