exports.up = async knex =>
  knex.raw(
    'create index index_users_full_name on users using btree (lower("firstName" || \' \' || "lastName"))'
  );

exports.down = knex => knex.raw('drop index index_users_full_name');
