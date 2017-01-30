var bcrypt = require('bcrypt-nodejs');
var pool = require('./connectionPool');
var validator = require('validator');
var Model = require('./model');

const usernameRegex = /^\w{6,16}$/;
const passwordRegex = /^.{8,128}$/; 

function validateUsername(user) {
  if (!usernameRegex.test(user.username)) {
    user.errors.push('Invalid username.');
    return false;
  }
  return true;
}

function validatePassword(user) {
  if (!user.encrypted && !passwordRegex.test(user.password)) {
    user.errors.push('Invalid password.');
    return false;
  }
  return true;
}

function validateEmail(user) {
  if (!validator.isEmail(user.email)) {
    user.errors.push('Invalid email.');
    return false;
  }
  return true;
}

class User extends Model {
  constructor(email = null, username = null, password = null) {
    super('user', 'users'); // table name

    // properties
    this.addColumn('email', email);
    this.addColumn('username', username);
    this.addColumn('password', password);
    this.encrypted = false;

    // validators
    this.registerValidator(validateUsername);
    this.registerValidator(validatePassword);
    this.registerValidator(validateEmail);
  }

  get valid() {
    if (this.saved) return true;
    return super.valid;
  }

  get sendable() {
    // Get an object that can be returned by JSON api (no password hash)
    return {
      id: this.id,
      email: this.email,
      username: this.username
    };
  }

  encryptPassword() {
    if (!this.encrypted) {
      this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
      this.encrypted = true;
    }
  }

  loadRow(row) {
    super.loadRow(row);
    this.encrypted = true;
  }

  static delete(id) {
    // Return promise for postgres delete
    return new Promise(function(resolve, reject) {
      pool.connect((err, client, done) => {
        if (err) {
          reject(new Error('Could not connect to database.'));
          return;
        }

        var query = `DELETE FROM users WHERE id='${id}'`;
        client.query(query, (err, result) => {
          done();  // release db connection
          if (err) {
            reject(new Error('Failed to delete user.'));
          } else {
            resolve(id);
          }
        });
      });
    });
  }

  static validatePassword(text, hashed) {
    //console.log(text, hashed);
    return bcrypt.compareSync(text, hashed);
  }
}

module.exports = User;
