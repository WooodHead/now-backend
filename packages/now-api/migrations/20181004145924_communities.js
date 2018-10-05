const globalId = '89b4d825-1b46-4eb8-8e3f-f6b7e30d0296';
exports.up = knex =>
  knex.raw('create extension if not exists pgcrypto').then(() =>
    knex.schema
      .createTable('communities', table => {
        table.uuid('id').primary();
        table.string('name');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
      })
      .createTable('memberships', table => {
        table.uuid('id').primary();
        table.uuid('communityId').index();
        table.uuid('userId');
        table.unique(['userId', 'communityId']);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
      })
      .table('events', t => {
        t.uuid('communityId').defaultTo(globalId);
      })
      .then(() =>
        knex
          .table('communities')
          .insert({ id: globalId, name: 'Global Community' })
      )
      .then(() =>
        knex.raw(
          `INSERT INTO "memberships" ("id", "communityId", "userId") SELECT gen_random_uuid() id, '${globalId}' "communityId" , id "userId" FROM users`
        )
      )
  );

exports.down = knex =>
  knex.schema
    .dropTable('memberships')
    .dropTable('communities')
    .table('events', table => {
      table.dropColumn('communityId');
    });
