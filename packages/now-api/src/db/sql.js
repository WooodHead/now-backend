import knex from 'knex';
import { setPgTypes } from './types';
import knexConfig from '../../knexfile';

const config = knexConfig[process.env.NODE_ENV];
const sql = knex(config);

setPgTypes(sql);

export default sql;
export const connection = config.connection; // eslint-disable-line prefer-destructuring

export const genRandomUuid = () => sql.raw('gen_random_uuid()');
export const makepoint = (x, y) => sql.raw('st_makepoint(?, ?)', x, y);
export const now = () => sql.raw('now()');
