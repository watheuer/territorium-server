var redis = require('redis');

// redis clients for value store, publish
var storeClient = redis.createClient();
var pubClient = redis.createClient();

module.exports = {
  storeClient: storeClient,
  pubClient: pubClient
};
