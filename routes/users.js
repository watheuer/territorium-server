var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();
var User = require('../models/user');

/* POST new user */
router.post('/', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  var user = new User(username, password);
  var ret = user.save();
  if (ret) {
    res.status(200).json({user: user.username});
  } else {
    res.status(400).json({error: "Please provide a valid username and password."});
  }
});

module.exports = router;
