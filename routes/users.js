var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();
var User = require('../models/user');

var jwt = require('jsonwebtoken');
var jwtSecret = process.env.JWT_SECRET;

/* POST new user */
router.post('/', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  var user = new User(username, password);
  user.encryptPassword();

  if (!user.valid) {
    return res.status(400).json({error: "Invalid username or password. Username must be 6 characters or longer, and password must by 8 characters or longer. Only alphanumeric characters and underscores are allowed."});
  }
  
  user.save().then(function(user) {
    res.json({
      status: 'success',
      data: {
        user: user.sendable()
      }
    });
  }, function(err) {
    res.status(400).json({
      status: 'error',
      message: err.message 
    });
  });
});

router.delete('/', function(req, res, next) {
  if (!req.body.token) {
    return res.status(400).json({error: 'Please provide a valid token.'});
  }

  jwt.verify(req.body.token, jwtSecret, function(err, decoded) {
    if (err) {
      res.status(400).json({error: 'Invalid token.'});
    } else {
      User.delete(decoded.id).then(function(result) {
        res.json({
          status: 'success',
          data: null
        });
      }, function(err) {
        res.status(400).json({
          status: 'error',
          message: err.message 
        });
      });
    }
  });
});

module.exports = router;
