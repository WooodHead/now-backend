import uuid from 'uuid';
import { scan, put, getTemplate } from '../../db';

const allActivityTemplates = () => scan('now_template');
const activityTemplateQuery = (root, { id }) => getTemplate(id);

export const queries = {
  template: activityTemplateQuery,
  allActivityTemplates,
};

const createActivityTemplate = (
  root,
  { input: { title, description, duration, emoji } }
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
    emoji
  };
  return put('now_template', newActivityTemplate).then(() => ({
    template: getTemplate(newId),
  }));
};

export const mutations = { createActivityTemplate };
