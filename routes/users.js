var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();

var User = require('../models/user');
var UserBatch = require('../models/userBatch');
var verifyLogin = require('../models/verifyLogin.js');

/* POST new user */
router.post('/', function(req, res) {
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  
  // TODO: This is just for alpha testing
  var lat = 46.83375;
  var lng = -121.94374;

  var user = new User(email, username, password, lat, lng);

  if (!user.valid) {
    return res.status(400).json({
      message: user.errors.join(' ')
    });
  }
  user.encryptPassword();
  
  user.save().then(function(result) {
    res.json({
      data: {
        user: result.serialize()
      }
    });
  }, function(err) {
    res.status(500).json({
      message: err.message 
    });
  });
});

router.get('/:userId', verifyLogin, function(req, res) {
  // TODO: This should be locked down to internal only
  // We don't want spam, data mining, etc
  // Also, shouldn't return email
  var user = new User();
  user.load(req.params.userId).then(function(result) {
    res.json({
      data: {
        user: result.serialize()
      }
    });
  }, function(err) {
    res.status(404).json({
      message: err.message
    });
  });
});


router.post('/batch/id', function(req, res) {
  var ids = req.body.ids;
  var userBatch = new UserBatch(ids);
  userBatch.load().then(function(result) {
    res.json({
      data: {
        users: result.serialize()
      }
    });
  }, function(err) {
    res.status(404).json({
      message: err.message
    });
  });
});


router.delete('/', verifyLogin, function(req, res) {
  User.delete(req.decoded.id).then(function(result) {
    res.sendStatus(204); // success!
  }, function(err) {
    res.status(404).json({
      message: err.message 
    });
  });
});

module.exports = router;
