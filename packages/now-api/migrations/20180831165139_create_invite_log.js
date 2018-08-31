exports.up = knex =>
  knex.schema
    .createTable('invitationLog', table => {
      table.increments();
      table.uuid('inviteeId').index();
      table.uuid('inviteId').index();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
    })
    .then(() =>
      knex.raw(
        'INSERT INTO "invitationLog" ("inviteeId", "inviteId") SELECT "inviteeId", id FROM invitations WHERE "inviteeId" is not NULL'
      )
    );
exports.down = knex => knex.schema.dropTable('invitationLog');
