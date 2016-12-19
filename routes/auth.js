var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var jwtSecret = "lolnotreal";

/* POST login */
router.post('/login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  console.log("login attempt: " + username + ", " + password);

  // TODO: real authentication
  if (username === "John" && password === "Doe") {
    var profile = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@doe.com',
      id: 123
    };

    var token = jwt.sign(profile, jwtSecret, { expiresIn: "5h" });
    res.json({token: token});
  } else {
    res.json({error: "Authentication failed."});
  }
});

module.exports = router;
