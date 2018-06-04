// Update with your config settings.

const host = process.platform === 'linux' ? '/var/run/postgresql' : 'localhost';

const build = (connection, opts = {}) => ({
  client: 'postgresql',
  connection,
  pool: {
    min: 2,
    max: 10,
    afterCreate: (conn, done) => {
      conn.query('SET timezone="UTC";', err => done(err, conn));
    },
  },
  migrations: {
    tableName: 'knex_migrations',
    stub: 'src/db/migration.stub',
  },
  ...opts,
});

module.exports = {
  development: build({
    database: 'meetup_now',
    host,
  }),
  test: build({
    database: 'meetup_now_test',
    host,
  }),
  production: build(process.env.DB_CONNECTION),
};
