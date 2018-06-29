exports.up = knex =>
  knex.schema
    .createTable('rsvpLog', table => {
      table.increments();
      table.uuid('userId').index();
      table.uuid('eventId').index();
      table.string('action');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
    })
    .then(() =>
      knex.raw(
        'INSERT INTO "rsvpLog" ("userId", "eventId", action) SELECT "userId", "eventId", action FROM rsvps'
      )
    );

exports.down = knex => knex.schema.dropTable('rsvpLog');
