import knex from 'knex';
import { setPgTypes } from './types';
import knexConfig from '../../knexfile';

const config = knexConfig[process.env.NODE_ENV];
const sql = knex(config);

setPgTypes(sql);

export default sql;
export const connection = config.connection; // eslint-disable-line prefer-destructuring

// Facilitates date mocking for tests
let nowReturn = sql.raw('now()');
export const changeNow = newNow => {
  nowReturn = newNow;
};

export const genRandomUuid = () => sql.raw('gen_random_uuid()');
export const makepoint = (x, y) => sql.raw('st_makepoint(?, ?)', [x, y]);
export const now = () => nowReturn;
export const prefixSearch = (column, prefix, ilike = false) => {
  const safePrefix = `${prefix.replace(/[\\%_]/g, '')}%`;
  return [
    column,
    ilike ? 'ilike' : 'like',
    ilike ? safePrefix : sql.raw('lower(?)', safePrefix),
  ];
};
