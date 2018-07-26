exports.up = knex =>
  knex.raw(
    'alter table users alter column preferences set data type jsonb using preferences::jsonb'
  );

exports.down = knex =>
  knex.raw(
    'alter table users alter column preferences set data type json using preferences::json'
  );
