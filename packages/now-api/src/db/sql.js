import knex from 'knex';
import { setPgTypes } from './types';
import knexConfig from '../../knexfile';

const config = knexConfig[process.env.NODE_ENV];
const sql = knex(config);

setPgTypes(sql);

export default sql;
export const connection = config.connection; // eslint-disable-line prefer-destructuring
