const uuid = require('uuid/v4');

exports.up = knex =>
  knex('serverMessages').insert([
    {
      id: uuid(),
      key: 'categoriesHeading',
      text: 'Host Your Activity',
    },
    {
      id: uuid(),
      key: 'categoriesSubheading',
      text: `Choose a category based on what you're excited to do.`,
    },
  ]);

exports.down = knex =>
  knex('serverMessages')
    .whereIn('key', ['categoriesHeading', 'categoriesSubheading'])
    .del();
