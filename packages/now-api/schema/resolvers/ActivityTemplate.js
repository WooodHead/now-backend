import uuid from 'uuid';
import { scan, get, put } from '../../db';

const allActivityTemplates = () => scan('now_template');
const template = id => get('now_template', { id });

const activityTemplateQuery = (root, { id }) => template(id);

export const queries = {
  template: activityTemplateQuery,
  allActivityTemplates,
};

const createActivityTemplate = (
  root,
  { input: { title, description, duration } }
) => {
  const newId = uuid.v1();
  const ISOString = new Date().toISOString();
  const newActivityTemplate = {
    id: newId,
    title,
    description,
    slug: 'nowSlug',
    duration,
    createdAt: ISOString,
    updatedAt: ISOString,
  };
  return put('now_template', newActivityTemplate).then(() => ({
    template: template(newId),
  }));
};

export const mutations = { createActivityTemplate };
