const fields = [
  {
    id: '797cad62-68dd-45ed-b854-7f6a10806728',
    params: {
      header: 'Now, tell us about your activity.',
      label: "What We'll Do",
      placeholder: 'A generic placeholder for text 1',
    },
    type: 'Text',
  },
  {
    id: '983b8efb-12bf-4adf-bcf4-e37366a62e41',
    params: {
      header: 'Now, tell us about your activity.',
      label: "Who's This For",
      placeholder: 'A generic placeholder for text 2',
    },
    type: 'Text',
  },
  {
    id: '23a6de38-5cd1-4e70-aaed-c500ecb5773c',
    params: {
      header: 'Now, tell us about your activity.',
      label: 'Any Requirements',
      placeholder: 'A generic placeholder for text 3',
    },
    type: 'Text',
  },
  {
    id: 'c3018c9d-a050-40b5-bef2-a77871e54ba6',
    params: {
      header: 'Finally, give your activity a title.',
      placeholder: 'A generic placeholder for text 4',
    },
    type: 'Text',
  },
];

export const tempTemplates = {
  'a959a300-c018-11e8-b62d-db7fbb06ca6d': {
    id: 'a959a300-c018-11e8-b62d-db7fbb06ca6d',
    title: 'Ask Me Anything About',
    description:
      'Allowing people to learn from your experiences will expand their beliefs and increase their empathy for the world around them.',
    fields,
  },
  'a9b0eba6-c018-11e8-b09c-134125e0116b': {
    id: 'a9b0eba6-c018-11e8-b09c-134125e0116b',
    title: 'Am I The Only One Who',
    description:
      'Making yourself vulnerable is tough, but you might just find you’re not as alone as you think.',
    fields,
  },
  'aa000880-c018-11e8-8218-f7becb600c0d': {
    id: 'aa000880-c018-11e8-8218-f7becb600c0d',
    title: 'Party Time',
    description:
      'Allowing people to learn from your party skills and experiences.',
    fields,
  },
};

const getTemplate = (root, { id }) => tempTemplates[id];

export const queries = { template: getTemplate };
