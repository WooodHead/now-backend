import knex from 'knex';
import knexConfig from '../../knexfile';

const sql = knex(knexConfig[process.env.NODE_ENV]);

export default sql;
