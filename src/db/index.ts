import knex from 'knex';
import config from '@app/knexfile';

const db = knex(config.development);

export default db;
