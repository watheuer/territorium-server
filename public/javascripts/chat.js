var socket = '';
var connected = false;
var chatForm = $('#f');
var input = $('#m');
var messages = $('#messages');
var loginForm = $('#login');
var registerForm = $('#register');

// setup canvas
var canvas = document.getElementById('drawCanvas');
var ctx = canvas.getContext("2d");
ctx.fillStyle = "#FF0000";

function draw_user(x, y) {
  ctx.fillRect(x, y, 15, 15);
}

draw_user(100, 100);

function connect_socket (token) {
  socket = io.connect('', {
    query: 'token=' + token
  });

  socket.on('connect', function() {
    console.log('authenticated');
    connected = true;
  });
  
  socket.on('disconnect', function() {
    console.log('disconnected');
  });

  socket.on('chat', function(msg) {
    messages.append("<li>" + msg + "</li>");
  });
}

registerForm.submit(function(e) {
  var username = $('#register-username').val();
  var password = $('#register-password').val();

  $.post('/users', {
    username: username,
    password: password
  }).done(function(result) {
    alert(result);
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
    connect_socket(result.token);
  }).fail(function(err) {
    alert('Failed to log in.');
  });

  loginForm.trigger('reset');
  return false;
});

chatForm.submit(function(e) {
  if (connected) {
    socket.emit('chat', input.val());
    input.val('');
  } else {
    alert("Please log in.");
  }

  return false;
});

