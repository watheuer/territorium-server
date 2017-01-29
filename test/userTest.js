var assert = require('assert');

var User = require('../models/user');

describe('User', function() {
  describe('valid', function() {
    describe('username', function() {
      it('rejects spaces', function() {
        var user = new User('this is a bad username', 'password');
        assert.equal(user.valid, false);
      });

      it('allows underscores', function() {
        var user = new User('this_is_fine', 'password');
        assert.equal(user.valid, true);
      });

      it('requires minimum length', function() {
        var user = new User('2smal', 'password');
        assert.equal(user.valid, false);
      });

      it('has maximum length', function() {
        var user = new User('my_name_is_far_too_long_muahaha', 'password');
        assert.equal(user.valid, false);
      });
    });

    describe('password', function() {
      it('accepts any characters', function() {
        var user = new User('username', '$@#$*@# ($*&@(#))');
        assert.equal(user.valid, true);
      });

      it('must have minimum length', function() {
        var user = new User('username', '2short');
        assert.equal(user.valid, false);
      });

      it('has a maximum length', function() {
        var user = new User('username', 'thispasswordiswaytoolongandshouldberejectedimo');
        assert.equal(user.valid, false);
      });

      it('allows valid passwords', function() {
        var user = new User('username', 'a_great_password12');
        assert.equal(user.valid, true);
      });
    });
  });

  describe('save', function() {
    var id;

    it('should let me save this user', function(done) {
      var user = new User('best_user', 'valid_password');
      user.encryptPassword();
      console.log('valid: ' + user.valid + ', encrypted: ', user.encrypted);
      user.save().then(function(result) {
        id = result.id;
        done();
      }, function(err) {
        done(err);
      });
    });

    it('should let me delete this user', function(done) {
      User.delete(id).then(function(result) {
        done();        
      }, function(err) {
        done(err);
      });
    });

  });
});
