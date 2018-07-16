exports.up = knex =>
  knex
    .raw('create extension if not exists postgis')
    .then(() =>
      knex.schema.table('locations', t => {
        t.specificType('location', 'geography(point)');
        t.index('location', 'locations_location_gist_index', 'gist');
      })
    )
    .then(() =>
      knex('locations').update({
        location: knex.raw('st_makepoint(lng, lat)'),
      })
    )
    .then(() =>
      knex.schema.table('locations', t => {
        t.dropColumn('lng');
        t.dropColumn('lat');
      })
    );

exports.down = knex =>
  knex.schema
    .table('locations', t => {
      t.float('lat');
      t.float('lng');
    })
    .then(() =>
      knex('locations').update({
        lng: knex.raw('st_x(location::geometry)'),
        lat: knex.raw('st_y(location::geometry)'),
      })
    )
    .then(() => knex.schema.table('locations', t => t.dropColumn('location')));
