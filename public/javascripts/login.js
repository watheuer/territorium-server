var loginForm = $('#login');
var registerForm = $('#register');

registerForm.submit(function(e) {
  var email = $('#register-email').val();
  var username = $('#register-username').val();
  var password = $('#register-password').val();

  $.post('/users', {
    email: email,
    username: username,
    password: password
  }).done(function(result) {
    alert('Successfully registered');
  }).fail(function(err) {
    alert(err.responseText);
  });

  registerForm.trigger('reset');
  return false;
});

loginForm.submit(function(e) {
  var username = $('#username').val();
  var password = $('#password').val();

  $.post('/auth/login', {
    username: username,
    password: password
  }).done(function(result) {
    // connect to socket with token
    alert('Logged in');
  }).fail(function(err) {
    alert('Failed to log in.');
  });

  loginForm.trigger('reset');
  return false;
});

