export const fieldOrder = [
  'eventWhen',
  'eventWhere',
  'eventSize',
  'eventWhat',
  'eventWho',
  'eventHow',
  'eventTitle',
];
export const fields = {
  eventWho: {
    id: '507fa987-94a4-4b41-8aa3-aabf5ca72faa',
    type: 'Text',
    params: {
      header: `Who's this for`,
      placeholder:
        'Who can participate in your activity? Who might really enjoy it?',
    },
  },
  eventWhat: {
    id: '67d913bd-cca2-4671-8925-d9c8ff7b991d',
    type: 'Text',
    params: {
      header: `What we'll do`,
      placeholder:
        'Explain what your activity is about and what people attending can expect',
    },
  },
  eventWhere: {
    id: '8498faed-78e4-4c0d-9c96-776d46caeeae',
    type: 'Location',
    params: {
      header: 'Where is it going to be?',
      label: 'Placeholder label',
      placeholder: 'Placeholder...placeholder',
    },
  },
  eventWhen: {
    id: '09792458-e2eb-4926-aab5-25281e71c6f2',
    type: 'Text', // should be date range
    params: {
      header: 'When is your activity?',
      placeholder: 'This is some placeholder text',
    },
  },
  eventHow: {
    id: '91ed52b9-0eb0-4f04-8cc3-727697df15b0',
    type: 'Text',
    params: {
      header: 'Any requirements',
      placeholder:
        'Is there anything participants should bring? Do participants require any special knowledge?',
    },
  },
  eventSize: {
    id: '8c6429d2-c13c-4bf2-8cb5-afadf6e5b15e',
    type: 'NumberRange',
    params: {
      header: 'How many people can join?',
      minLabel: 'Minimum',
      min: 4,
      maxLabel: 'Maximum',
      max: 12,
      hint:
        'If less than 4 people join your activity by the start time, it’ll have to be cancelled :(',
    },
  },
  eventTitle: {
    id: '349c804f-4d8f-4362-bb1c-dc093366879f',
    type: 'Text',
    params: {
      header: 'Finally, give your activity a title',
      placeholder: `Let's...`,
    },
  },
};

export const tempTemplates = {
  'a959a300-c018-11e8-b62d-db7fbb06ca6d': {
    id: 'a959a300-c018-11e8-b62d-db7fbb06ca6d',
    title: 'Ask Me Anything',
    description:
      'Open up about an experience or an aspect of your identity that allows people to better understand the world around them.',
    ...fields,
    fieldOrder,
  },
  'a9b0eba6-c018-11e8-b09c-134125e0116b': {
    id: 'a9b0eba6-c018-11e8-b09c-134125e0116b',
    title: 'Am I The Only One',
    description:
      'Making yourself vulnerable is tough, but you might just find you’re not as alone as you think.',
    ...fields,
    fieldOrder,
  },
  'aa000880-c018-11e8-8218-f7becb600c0d': {
    id: 'aa000880-c018-11e8-8218-f7becb600c0d',
    title: 'Party Time',
    description:
      'Allowing people to learn from your party skills and experiences.',
    ...fields,
    fieldOrder,
  },
};

const getTemplate = (root, { id }) => tempTemplates[id];

export const queries = { template: getTemplate };
