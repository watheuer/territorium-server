var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();
var User = require('../models/user');

var jwt = require('jsonwebtoken');
var jwtSecret = process.env.JWT_SECRET;

/* POST new user */
router.post('/', function(req, res, next) {
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;

  var user = new User(email, username, password);

  if (!user.valid) {
    return res.status(400).json({
      message: user.errors.join(' ')
    });
  }
  user.encryptPassword();
  
  user.save().then(function(result) {
    res.json({
      data: {
        user: result.sendable
      }
    });
  }, function(err) {
    res.status(500).json({
      message: err.message 
    });
  });
});

router.delete('/', function(req, res, next) {
  if (!req.body.token) {
    return res.status(400).json({
      message: 'Please provide a token.'
    });
  }

  jwt.verify(req.body.token, jwtSecret, function(err, decoded) {
    if (err) {
      res.status(401).json({
        message: 'Invalid token.'
      });
    } else {
      User.delete(decoded.id).then(function(result) {
        res.sendStatus(204); // success!
      }, function(err) {
        res.status(404).json({
          message: err.message 
        });
      });
    }
  });
});

module.exports = router;
