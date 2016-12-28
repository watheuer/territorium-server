var express = require('express');
var router = express.Router();
var pool = require('../models/connectionPool');
var User = require('../models/user');

var jwt = require('jsonwebtoken');
var jwtSecret = process.env.JWT_SECRET;

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
    var query = 'SELECT * FROM users WHERE username=\'' + username + '\'';
    client.query(query, (err, result) => {
      done(); // release db connection
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      if (!result.rows.length) {
        return res.status(400).json({error: "User not found."});
      }

      var user = new User(result.rows[0].username, result.rows[0].password);

      // send token for valid password
      if (user.validPassword(password)) {
        var profile = {
          id: result.rows[0].id,
          username: user.username
        };
        var token = jwt.sign(profile, jwtSecret, { expiresIn: "5h" });
        res.json({token: token});
      } else {
        res.status(400).json({error: "Incorrect password."});
      }
    }); 
  });
});

module.exports = router;
