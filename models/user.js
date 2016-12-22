var bcrypt = require('bcrypt-nodejs');

class User {
  constructor(username = null, password = null) {
    this.username = username;
    this.password = password;
  }
  encryptPassword() {
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
  }
  validPassword(password) {
    console.log(password, this.password);
    return bcrypt.compareSync(password, this.password);
  }
}

module.exports = User;
