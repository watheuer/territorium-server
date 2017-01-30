var assert = require('assert');

var User = require('../models/user');

describe('User', function() {
  describe('valid', function() {
    describe('username', function() {
      it('should reject spaces', function() {
        var user = new User('good@email.com', 'this is a bad username', 'password');
        assert.equal(user.valid, false);
      });

      it('should allow underscores', function() {
        var user = new User('good@email.com', 'this_is_fine', 'password');
        assert.equal(user.valid, true);
      });

      it('should require minimum length', function() {
        var user = new User('good@email.com', '2smal', 'password');
        assert.equal(user.valid, false);
      });

      it('should have maximum length', function() {
        var user = new User('good@email.com', 'my_name_is_far_too_long_muahaha', 'password');
        assert.equal(user.valid, false);
      });
    });

    describe('password', function() {
      it('should accept any characters', function() {
        var user = new User('good@email.com', 'username', '$@#$*@# ($*&@(#))');
        assert.equal(user.valid, true);
      });

      it('should have minimum length', function() {
        var user = new User('good@email.com', 'username', '2short');
        assert.equal(user.valid, false);
      });

      it('should have maximum length', function() {
        var user = new User('good@email.com', 'username', 'ab'.repeat(128));
        assert.equal(user.valid, false);
      });

      it('should allow valid passwords', function() {
        var user = new User('good@email.com', 'username', 'a_great_password12');
        assert.equal(user.valid, true);
      });
    });
  });

  describe('save', function() {
    var id;

    it('should let me save this user', function(done) {
      var user = new User('someone@test.com', 'best_user', 'valid_password');
      user.encryptPassword();
      console.log('valid: ' + user.valid + ', encrypted: ', user.encrypted);
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
