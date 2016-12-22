var bcrypt = require('bcrypt-nodejs');

class User {
  constructor(username = null, password = null) {
    this.username = username;
    if (password !== null) {
      password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    }
    this.password = password;
  }
  validPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }
}

module.exports = User;
