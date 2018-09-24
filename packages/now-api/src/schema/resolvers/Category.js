import { tempTemplates } from './Template';

const tempCategories = {
  '39c7359a-c011-11e8-a203-0bedd5070da4': {
    id: '39c7359a-c011-11e8-a203-0bedd5070da4',
    title: 'Explore',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus eget mauris ipsum.',
    templateIds: ['a959a300-c018-11e8-b62d-db7fbb06ca6d'],
  },
  '3aa4b47e-c011-11e8-9743-0775211e350d': {
    id: '3aa4b47e-c011-11e8-9743-0775211e350d',
    title: 'Discuss',
    description: 'Praesent a nunc dictum, congue elit at, porta dolor.',
    templateIds: [
      'a959a300-c018-11e8-b62d-db7fbb06ca6d',
      'a9b0eba6-c018-11e8-b09c-134125e0116b',
    ],
  },
  '3ad0c348-c011-11e8-a459-271050f53c12': {
    id: '3ad0c348-c011-11e8-a459-271050f53c12',
    title: 'Watch',
    description: 'Nam vel nisl ac velit scelerisque tincidunt quis et nunc.',
    templateIds: [
      'a959a300-c018-11e8-b62d-db7fbb06ca6d',
      'a9b0eba6-c018-11e8-b09c-134125e0116b',
      'aa000880-c018-11e8-8218-f7becb600c0d',
    ],
  },
};

const getCategories = () => Object.values(tempCategories);

const getCategory = (root, { id }) => tempCategories[id];

export const queries = { category: getCategory, categories: getCategories };

const templates = ({ templateIds }) => templateIds.map(id => tempTemplates[id]);

export const resolvers = { templates };
