var pg = require('pg');

var config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  max: process.env.DB_MAX_CONNECTIONS,
  idleTimeoutMillis: 30000
};

var pool = new pg.Pool(config);

module.exports = pool;
