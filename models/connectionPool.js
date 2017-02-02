var pg = require('pg');
var url = require('url');

const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(':');

var config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  max: process.env.DB_MAX_CONNECTIONS,
  idleTimeoutMillis: 30000
};

var pool = new pg.Pool(config);

module.exports = pool;
