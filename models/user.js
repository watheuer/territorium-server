var bcrypt = require('bcrypt-nodejs');
var pool = require('./connectionPool');

var usernameRegex = /^\w{6,16}$/;
var passwordRegex = /^.{8,20}$/;

class User {
  constructor(username = null, password = null, saved = false) {
    this.id = null;
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

  get sendable() {
    // Get an object that can be returned by JSON api (no password hash)
    return {
      id: this.id,
      username: this.username
    };
  }

  encryptPassword() {
    if (!this.encrypted) {
      this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
      this.encrypted = true;
    }
  }

  save() {
    // Return promise for postgres insert
    var user = this;
    return new Promise(function(resolve, reject) {
      if (!user.valid || !user.encrypted) {
        reject(new Error('Invalid or unencrypted user.'));
        return;
      }

      pool.connect((err, client, done) => {
        if (err) {
          reject(new Error('Could not connect to database.'));
          return;
        }

        const query = `INSERT INTO users (username, password) VALUES ('${user.username}', '${user.password}') RETURNING id`;
        client.query(query, (err, result) => {
          done();  // release db connection

          if (err) {
            reject(new Error('User with that username already exists.'));
          } else {
            // update object with saved and id
            user.saved = true;
            user.id = result.rows[0].id;

            resolve(user);
          }
        });
      });
    });
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
