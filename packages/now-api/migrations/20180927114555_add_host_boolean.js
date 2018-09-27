exports.up = knex =>
  knex.schema
    .table('rsvps', t =>
      t
        .boolean('host')
        .notNullable()
        .default(false)
    )
    .then(() =>
      knex.schema.table('rsvpLog', t =>
        t
          .boolean('host')
          .notNullable()
          .default(false)
      )
    );

exports.down = knex =>
  knex.schema
    .table('rsvps', t => t.dropColumn('host'))
    .then(() => knex.schema.table('rsvpLog', t => t.dropColumn('host')));
