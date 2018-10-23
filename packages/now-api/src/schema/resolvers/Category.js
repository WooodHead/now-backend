import { tempTemplates } from './Template';
import { buildEdge } from '../../schema/util';

const tempCategories = {
  'd2ec5baa-638e-44f1-88d3-a67af0e1e9d0': {
    id: 'd2ec5baa-638e-44f1-88d3-a67af0e1e9d0',
    title: 'Explore',
    description:
      'Choose the activity that best allows you to discover new places, events, food, and more with others.',
    templateIds: [
      'ebf997e5-cf24-407f-b98d-5108d73b4044',
      'f2a7b3a5-b00f-4b23-a224-2db4049fec27',
    ],
  },
  'ec9c43f0-bdaf-4d5d-bfdc-830cc38ad50d': {
    id: 'ec9c43f0-bdaf-4d5d-bfdc-830cc38ad50d',
    title: 'Watch',
    description:
      'Choose the activity that best allows you to connect with others through shows, movies, concerts, and more.',
    templateIds: [
      'ef7ec7d3-6a3b-4c63-8450-ac5c1c3ce819',
      'ff18f172-74c3-4bcc-9c3e-45966c721869',
    ],
  },
  '5e27e0dc-5491-4dcf-99de-e33e20c13eeb': {
    id: '5e27e0dc-5491-4dcf-99de-e33e20c13eeb',
    title: 'Discuss',
    description:
      'Choose the activity that best allows you to connect with others through conversation.',
    templateIds: [
      '8f0f400f-0cd5-43dd-b357-3cc3f07be2bf',
      '0b721d9e-ead6-4a35-9b98-82b780ebd32a',
      'c26283a6-8aac-46ba-862c-889c42817dfa',
      'b5096d9f-7bba-4259-9bd2-2b2497e361b4',
    ],
  },
  'c5d89a42-3b04-43ea-90ae-e7a4e27aff5d': {
    id: 'c5d89a42-3b04-43ea-90ae-e7a4e27aff5d',
    title: 'Play',
    description:
      'Choose the activity that best allows you to connect with others through fun competition.',
    templateIds: [
      '6deb37cb-9f39-4ede-936a-20339a1b258c',
      '54d49999-4731-48ee-88a1-db8fe803f048',
    ],
  },
  '20cb2104-3f4a-477e-b792-e5595b9c5069': {
    id: '20cb2104-3f4a-477e-b792-e5595b9c5069',
    title: 'Learn',
    description:
      'Choose the activity that allows you to connect with others through sharing your skills, hobbies, and more.',
    templateIds: [
      'f6676ffa-f182-4067-9138-35223a6bf4e8',
      '46b8e494-bdc9-4b71-8e11-4cb325e01df9',
    ],
  },
  '716157ed-64a8-4036-ae88-a4c6cf19b04a': {
    id: '716157ed-64a8-4036-ae88-a4c6cf19b04a',
    title: 'Hang Out',
    description:
      'Choose the activity that best allows you to connect with others through social gatherings.',
    templateIds: ['d95e9bc7-dd14-48de-a800-e7fc1fe28228'],
  },
};

export const categoryQuery = id => tempCategories[id];

const getCategory = (root, { id }) => categoryQuery(id);

const getCategories = () => Object.values(tempCategories);

const getAllCategories = (root, { orderBy = 'title' }) => {
  const data = Object.values(tempCategories).sort(
    (a, b) => a[orderBy] > b[orderBy]
  );
  return {
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
    count: data.length,
    edges: data.map(d => buildEdge(orderBy, d)),
  };
};

export const queries = {
  category: getCategory,
  categories: getCategories,
  allCategories: getAllCategories,
};

const templates = ({ templateIds }) => templateIds.map(id => tempTemplates[id]);

export const resolvers = { templates };
