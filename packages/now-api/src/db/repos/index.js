import sql from '../sql';
import { SQL_TABLES } from '../constants';
import { putInOrder } from '../../util';

const buildRepo = table => {
  const base = {
    get: (query = {}) =>
      sql(table)
        .where(query)
        .first(),
    all: (query = {}) => sql(table).where(query),
    insert: obj => sql(table).insert(obj),
    update: ({ id, ...otherFields }) =>
      sql(table)
        .where({ id })
        .update(otherFields),
    batch: ids =>
      sql(table)
        .whereIn('id', ids)
        .then(batch => putInOrder(batch, ids)),
    delete: query =>
      sql(table)
        .where(query)
        .delete(),
  };

  base.byId = id => base.get({ id });

  return base;
};

export const User = buildRepo(SQL_TABLES.USERS);
export const Device = buildRepo(SQL_TABLES.DEVICES);
export const Activity = buildRepo(SQL_TABLES.ACTIVITIES);
export const Event = buildRepo(SQL_TABLES.EVENTS);
export const Location = buildRepo(SQL_TABLES.LOCATIONS);
export const Rsvp = buildRepo(SQL_TABLES.RSVPS);
export const Message = buildRepo(SQL_TABLES.MESSAGES);
