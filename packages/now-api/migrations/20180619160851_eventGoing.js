exports.up = knex =>
  knex.schema
    .table('events', table => {
      table.integer('going').defaultTo(0);
    })
    .then(() =>
      knex.raw(
        'UPDATE events SET "going" = ec.going FROM (SELECT count(rsvps."eventId") as going, rsvps."eventId" as id FROM events JOIN rsvps ON rsvps."eventId" = events.id group by rsvps."eventId") AS ec WHERE ec.id = events.id'
      )
    );

exports.down = knex =>
  knex.schema.table('events', table => {
    table.dropColumn('going');
  });
