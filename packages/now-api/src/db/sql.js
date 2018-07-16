import knex from 'knex';
import { setPgTypes } from './types';
import knexConfig from '../../knexfile';

const sql = knex(knexConfig[process.env.NODE_ENV]);

setPgTypes(sql);

export default sql;
