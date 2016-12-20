var bcrypt = require('bcrypt-nodejs');

class User {
  constructor(username = null, password = null) {
    this.username = username;
    if (password !== null) {
      password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    }
    this.password = password;
    this.saved = false;
  }
  save() {
    console.log('Saving user: %s, %s,', this.username, this.password);
    return this.username !== null && this.password !== null;
  }
  isSaved() {
    return this.saved;
  }
  validPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }
}

module.exports = User;
