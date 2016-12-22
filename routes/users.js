var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();
var User = require('../models/user');
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

/* POST new user */
router.post('/', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  var user = new User(username, password);
  
  console.log('Saving user: %s', user.username);
  pool.connect((err, client, done) => {
    if (err) {
      res.status(500).json({error: err});
      return;
    }

    var query = 'INSERT INTO users (username, password) VALUES (\'' + user.username + '\', \'' + user.password + '\');';
    console.log(query);
    client.query(query, (err, result) => {
      done();
      if (err) {
        console.error(err);
        res.status(400).json({error: "Failed to create user."});
      } else {
        res.status(200).json({user: user.username});
      }
    });
  });
});

module.exports = router;
