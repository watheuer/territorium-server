var jwt = require('jsonwebtoken');
var jwtSecret = process.env.JWT_SECRET;

function verifyLogin(req, res, next) {
  var header = req.get('Authorization');
  if (!header || header.split(' ').length !== 2 || header.split(' ')[0] !== 'Bearer') {
    return res.status(400).json({
      message: 'Please provide a token.'
    });
  }

  var token = header.split(' ')[1]; 

  jwt.verify(token, jwtSecret, function(err, decoded) {
    if (err) {
      res.status(401).json({
        message: 'Invalid token.'
      });
    } else {
      req.decoded = decoded;
      next();
    }
  });
}

module.exports = verifyLogin;
