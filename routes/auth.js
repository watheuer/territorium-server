var express = require('express');
var router = express.Router();
var pool = require('../models/connectionPool');
var User = require('../models/user');

var jwt = require('jsonwebtoken');
var jwtSecret = process.env.JWT_SECRET;


// TODO: redis?
//var redisConfig = require('../redisConfig');
//var storeClient = redisConfig.storeClient; 

var verifyLogin = require('../models/verifyLogin');

var players = [];

/* POST login */
router.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  pool.connect((err, client, done) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }

    var query = `SELECT * FROM users WHERE username='${username}'`;
    client.query(query, (err, result) => {
      done();
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
          players.push(user.id);

          // create token
          var profile = user.serialize();
          var token = jwt.sign(profile, jwtSecret, { expiresIn: "5h" });

          res.json({
            data: {
              token: token
            },
            user: user.serialize()
          });
        } else {
          res.status(400).json({
            message: 'User is already logged in.'
          });
        }
      } else {
        res.status(400).json({
          message: 'Incorrect password.'
        });
      }
    }); 
  });
});

router.post('/logout', verifyLogin, function(req, res) {
    var index = players.indexOf(req.decoded.id);
    if (index == -1) {
      res.status(400).json({
        message: 'Not currently logged in.'
      });
    } else {
      players.splice(index, 1);
      res.sendStatus(200);
    }
});

router.post('/internal/logout/:id', verifyLogin, function(req, res) {
  var id = parseInt(req.params.id);
  var lat = parseFloat(req.body.lat);
  var lng = parseFloat(req.body.lng);
  pool.connect((err, client, done) => {
    if (err) {
      console.error(err);
    }
    client.query("UPDATE users SET lat=$1, lng=$2 WHERE id=$3", [lat, lng, id], (err, result) => {
      done();
      if (err){
        return console.error(err);;
      }
    });
  });
  var index = players.indexOf(id);
  if (index == -1) {
    res.status(400).json({
      message: 'Not currently logged in.'
    });
  } else {
    players.splice(index, 1);
    res.sendStatus(200);
  }
});

module.exports = router;
