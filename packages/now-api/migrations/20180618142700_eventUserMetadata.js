const uuid = require('uuid/v4');

exports.up = knex =>
  knex.schema
    .createTable('eventUserMetadata', table => {
      table.uuid('id').primary();
      table.uuid('eventId');
      table.uuid('userId');
      table.bigInteger('lastReadTs');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.unique(['eventId', 'userId']);
    })
    .then(() =>
      knex('rsvps').then(results => {
        const readCounts = results.map(({ eventId, userId, lastReadTs }) => ({
          id: uuid(),
          eventId,
          userId,
          lastReadTs,
          createdAt: knex.raw('now()'),
          updatedAt: knex.raw('now()'),
        }));
        return knex.batchInsert('eventUserMetadata', readCounts);
      })
    );

exports.down = knex => knex.schema.dropTable('eventUserMetadata');
