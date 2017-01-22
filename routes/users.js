var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();
var User = require('../models/user');
var pool = require('../models/connectionPool');

/* POST new user */
router.post('/', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  var user = new User(username, password);
  user.encryptPassword();

  if (!user.valid) {
    return res.status(400).json({error: "Invalid username or password. Username must be 6 characters or longer, and password must by 8 characters or longer. Only alphanumeric characters and underscores are allowed."});
  }
  
  console.log('Saving user: %s', user.username);
  pool.connect((err, client, done) => {
    if (err) {
      return res.sendStatus(500);
    }

    var query = `INSERT INTO users (username, password) VALUES ('${user.username}', '${user.password}')`;
    client.query(query, (err, result) => {
      done();  // release db connection
      user.saved = true;
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
