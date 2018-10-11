const uuid = require('uuid/v4');

exports.up = knex =>
  knex('serverMessages').insert([
    {
      id: uuid(),
      key: 'confirmationHeading',
      text: 'Congrats, your activity has been submitted!',
    },
    {
      id: uuid(),
      key: 'confirmationSubheading',
      text:
        'Keep an eye out for an email from Meetup Now letting you know when your activity has been published for members to see and start joining!',
    },
    {
      id: uuid(),
      key: 'confirmationButton',
      text: 'Done',
    },
    {
      id: uuid(),
      key: 'previewWhat',
      text: 'What we will do',
    },
    {
      id: uuid(),
      key: 'previewWho',
      text: 'Who is this for',
    },
    {
      id: uuid(),
      key: 'previewHow',
      text: 'Any Requirements',
    },
    {
      id: uuid(),
      key: 'previewInstructions',
      text: 'Submit your activity to Meetup Now for review.',
    },
    {
      id: uuid(),
      key: 'previewButton',
      text: 'Submit',
    },
  ]);

exports.down = knex =>
  knex('serverMessages')
    .whereIn('key', [
      'confirmationHeading',
      'confirmationSubheading',
      'confirmationButton',
      'previewWhat',
      'previewWho',
      'previewHow',
      'previewInstructions',
      'previewButton',
    ])
    .del();
