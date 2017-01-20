var bcrypt = require('bcrypt-nodejs');

var usernameRegex = /\w{6,}/;
var passwordRegex = /.{8,}/;

class User {
  constructor(username = null, password = null, saved = false) {
    this.username = username;
    this.password = password;
    this.saved = saved;
    this.encrypted = saved;
  }
  get valid() {
    if (this.saved) return true;
    return usernameRegex.test(this.username) && 
           (passwordRegex.test(this.password) || this.encrypted); 
  }
  encryptPassword() {
    if (!this.encrypted) {
      this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
      this.encrypted = true;
    }
  }

  static validatePassword(text, hashed) {
    //console.log(text, hashed);
    return bcrypt.compareSync(text, hashed);
  }
}

module.exports = User;
