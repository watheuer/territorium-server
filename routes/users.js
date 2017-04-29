var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();

var User = require('../models/user');
var verifyLogin = require('../models/verifyLogin.js');

/* POST new user */
router.post('/', function(req, res) {
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
        user: result.serialize()
      }
    });
  }, function(err) {
    res.status(500).json({
      message: err.message 
    });
  });
});

//router.get('/:userId', verifyLogin, function(req, res) {
router.get('/:userId', function(req, res) {
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
