exports.up = knex =>
  knex.schema
    .table('events', table => {
      table.string('timezone');
    })
    .then(() =>
      knex('events').update({
        timezone: 'America/New_York',
        time: knex.raw("?? + interval '4 hours'", ['time']),
      })
    );

exports.down = knex =>
  knex('events')
    .update({
      time: knex.raw("?? - interval '4 hours'", ['time']),
    })
    .then(() =>
      knex.schema.table('events', table => {
        table.dropColumn('timezone');
      })
    );
