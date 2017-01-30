var express = require('express');
var router = express.Router();
var pool = require('../models/connectionPool');
var User = require('../models/user');

// TODO: redis?
//var redisConfig = require('../redisConfig');
//var storeClient = redisConfig.storeClient; 

var jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

var players = [];

/* POST login */
router.post('/login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  pool.connect((err, client, done) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }

    // query for user
    var query = `SELECT * FROM users WHERE username='${username}'`;
    client.query(query, (err, result) => {
      done(); // release db connection
      if (err) {
        console.error(err);
        return res.status(500).json({
          status: 'error',
          message: 'Could not connect to database.'
        });
      }
      if (!result.rows.length) {
        return res.status(400).json({
          status: 'error',
          message: 'User not found.'
        });
      }

      // user object for existing user
      var user = new User();
      user.loadRow(result.rows[0]);

      // validate password
      if (User.validatePassword(password, user.password)) {
        if (players.indexOf(user.id) == -1) {
          // create token
          var profile = user.sendable;
          var token = jwt.sign(profile, jwtSecret, { expiresIn: "5h" });

          players.push(user.id);
          res.json({
            status: 'success',
            data: {
              token: token
            }
          });
        } else {
          res.status(400).json({
            status: 'error',
            message: 'User is already logged in.'
          });
        }

        // check for user already logged in
        //storeClient.sismember('users.set', user.username, (err, ret) => {
        //  if (ret) {
        //    res.status(400).json({error: "User is already logged in."});
        //  } else {
        //    // create token
        //    var profile = {
        //      id: result.rows[0].id,
        //      username: user.username
        //    };
        //    var token = jwt.sign(profile, jwtSecret, { expiresIn: "5h" });
        //    res.json({token: token});
        //  }
        //});
      } else {
        res.status(400).json({
          status: 'error',
          message: 'Incorrect password.'
        });
      }
    }); 
  });
});

router.post('/logout', function(req, res, next) {
  if (!req.body.token) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide a valid token.'
    });
  }

  // verify token
  jwt.verify(req.body.token, jwtSecret, function(err, decoded) {
    if (err) {
      res.status(400).json({error: 'Invalid token.'});
    } else {
      // success
      var index = players.indexOf(decoded.id);
      if (index == -1) {
        res.status(400).json({
          status: 'error',
          message: 'Not currently logged in.'
        });
      } else {
        players.splice(index, 1);
        res.status(200).json({
          status: 'success',
          data: null
        });
      }
    }
  });
});

module.exports = router;
