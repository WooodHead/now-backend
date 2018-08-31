const uuid = require('uuid/v4');

exports.up = knex =>
  knex('serverMessages').insert({
    id: uuid(),
    key: 'inviteInstructions',
    text:
      'Share this code to people you want to invite to this Meetup. They will need this code to sign up.',
  });

exports.down = knex =>
  knex('serverMessages')
    .where('key', 'inviteInstructions')
    .delete();
