const DELETED_USER_ID = '7cb43790-3bed-4e23-9825-43d913074ee0';

exports.up = knex =>
  knex.schema
    .table('events', table => {
      table.integer('deletedUsers').default(0);
    })
    .then(() =>
      knex('users').insert({
        id: DELETED_USER_ID,
        auth0Id: 'INVALID',
        firstName: 'Deleted',
        lastName: 'User',
      })
    );

exports.down = knex =>
  knex('users')
    .where({ id: DELETED_USER_ID })
    .del()
    .then(() =>
      knex.schema.table('events', table => {
        table.dropColumn('deletedUsers');
      })
    );
