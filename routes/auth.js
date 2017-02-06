var express = require('express');
var router = express.Router();
var pool = require('../models/connectionPool');
var User = require('../models/user');

// TODO: redis?
//var redisConfig = require('../redisConfig');
//var storeClient = redisConfig.storeClient; 

var verifyLogin = require('../models/verifyLogin');

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
        return res.sendStatus(500);
      }
      if (!result.rows.length) {
        return res.status(404).json({
          message: 'User not found.'
        });
      }

      // user object for existing user
      var user = new User();
      user.loadRow(result.rows[0]);

      // validate password
      if (User.validatePassword(password, user.password)) {
        if (players.indexOf(user.id) == -1) {
          // append to logged in players
          players.push(user.id);

          // create token
          var profile = user.serialize();
          var token = jwt.sign(profile, jwtSecret, { expiresIn: "5h" });

          res.json({
            data: {
              token: token
            }
          });
        } else {
          res.status(400).json({
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
          message: 'Incorrect password.'
        });
      }
    }); 
  });
});

router.post('/logout', verifyLogin, function(req, res, next) {
    var index = players.indexOf(req.decoded.id);
    if (index == -1) {
      res.status(400).json({
        message: 'Not currently logged in.'
      });
    } else {
      players.splice(index, 1);
      res.sendStatus(204);
    }
});

module.exports = router;
