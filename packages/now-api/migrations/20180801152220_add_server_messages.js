const uuid = require('uuid/v4');

const legacyMessages = {
  noActivityTitle: 'Stay tuned!',
  noActivityMessage:
    'Tomorrow’s Meetup of the Day will be announced at 8 p.m. Make sure you join before spots fill up!',
  inviteExplain:
    'If you invite a friend, you will reserve both of your spots before everyone else.',
  inviteExpire: 'Your friend’s invite will expire at 9PM',
  oldClientTitle: "We've updated Meetup Now!",
  oldClientMessageIos: 'Go to the App Store and download the latest version.',
  oldClientMessageAndroid:
    'Go to the Play Store and download the latest version.',
};

exports.up = knex =>
  knex.schema
    .createTable('serverMessages', t => {
      t.uuid('id')
        .primary()
        .notNullable();
      t.string('key')
        .unique()
        .notNullable();
      t.text('text');
      t.datetime('createdAt').defaultTo(knex.raw('now()'));
      t.datetime('updatedAt').defaultTo(knex.raw('now()'));
    })
    .then(() =>
      knex('serverMessages').insert(
        Object.keys(legacyMessages).map(key => ({
          id: uuid(),
          key,
          text: legacyMessages[key],
        }))
      )
    );

exports.down = knex => knex.schema.dropTable('serverMessages');
