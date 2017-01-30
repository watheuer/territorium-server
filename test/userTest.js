var assert = require('assert');

var User = require('../models/user');

const validEmail = 'good@email.com';
const validUsername = 'username';
const validPassword = 'password';

describe('User', function() {
  describe('valid', function() {
    describe(validUsername, function() {
      it('should reject spaces', function() {
        var user = new User(validEmail, 'this is a bad username', validPassword);
        assert.equal(user.valid, false);
      });

      it('should allow underscores', function() {
        var user = new User(validEmail, 'this_is_fine', validPassword);
        assert.equal(user.valid, true);
      });

      it('should require minimum length', function() {
        var user = new User(validEmail, '2smal', validPassword);
        assert.equal(user.valid, false);
      });

      it('should have maximum length', function() {
        var user = new User(validEmail, 'my_name_is_far_too_long_muahaha', validPassword);
        assert.equal(user.valid, false);
      });
    });

    describe(validPassword, function() {
      it('should accept any characters', function() {
        var user = new User(validEmail, validUsername, '$@#$*@# ($*&@(#))');
        assert.equal(user.valid, true);
      });

      it('should have minimum length', function() {
        var user = new User(validEmail, validUsername, '2short');
        assert.equal(user.valid, false);
      });

      it('should have maximum length', function() {
        var user = new User(validEmail, validUsername, 'ab'.repeat(128));
        assert.equal(user.valid, false);
      });

      it('should allow valid passwords', function() {
        var user = new User(validEmail, validUsername, 'a_great_password12');
        assert.equal(user.valid, true);
      });
    });
  });

  describe('save', function() {
    var id;

    it('should let me save this user', function(done) {
      var user = new User(validEmail, validUsername, validPassword);
      user.encryptPassword();
      user.save().then(function(result) {
        id = result.id;
        done();
      }, function(err) {
        done(err);
      });
    });

    it('should allow user to be deleted', function(done) {
      User.delete(id).then(function(result) {
        done();        
      }, function(err) {
        done(err);
      });
    });
  });
});
