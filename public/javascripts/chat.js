var socket = '';
var connected = false;
var chatForm = $('#f');
var input = $('#m');
var messages = $('#messages');
var loginForm = $('#login');

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

loginForm.submit(function(e) {
  e.preventDefault();
  var username = $('#username').val();
  var password = $('#password').val();

  $.post('/auth/login', {
    username: username,
    password: password
  }).done(function (result) {
    // connect to socket with token
    connect_socket(result.token);
  });
});

chatForm.submit(function(e) {
  e.preventDefault();
  if (connected) {
    socket.emit('chat', input.val());
    input.val('');
  } else {
    alert("Please log in.");
  }
});

