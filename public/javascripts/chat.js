var socket;
var gameLoop;
var connected = false;

var chatForm = $('#f');
var input = $('#m');
var messages = $('#messages');
var loginForm = $('#login');
var registerForm = $('#register');

function connect_socket (token) {
  socket = io.connect('', {
    query: 'token=' + token
  });

  socket.on('connect', function() {
    console.log('authenticated');
    gameLoop = setInterval(gameStep, 16);
    connected = true;
  });
  
  socket.on('disconnect', function() {
    console.log('disconnected');
    clearInterval(gameLoop);
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


// PLAYER STUFF

var player = {
  x: 50.0,
  y: 50.0,
  dx: 0.0,
  dy: 0.0
};

var xVelocity = 1.5;
var yVelocity = 1.5;

// setup canvas
var canvas = document.getElementById('drawCanvas');
var ctx = canvas.getContext("2d");
ctx.fillStyle = "#FF0000";

function drawUser(x, y) {
  ctx.fillRect(x, y, 15, 15);
}

// keydown events
window.addEventListener("keydown", keyDown, false);
window.addEventListener("keyup", keyUp, false);

function keyDown(e) {
  switch(e.keyCode) {
    case 87: //w
      player.dy = -yVelocity;
      break;
    case 83: //s
      player.dy = yVelocity;
      break;
    case 68: //d
      player.dx = xVelocity;
      break;
    case 65: //a
      player.dx = -xVelocity;
      break;
  }
}

function keyUp(e) {
  switch(e.keyCode) {
    case 87: //w
      player.dy = 0.0;
      break;
    case 83: //s
      player.dy = 0.0;
      break;
    case 68: //d
      player.dx = 0.0;
      break;
    case 65: //a
      player.dx = 0.0;
      break;
  }
}

// GAME LOOP
var gameLoop;

function gameStep() {
  logicStep();
  drawStep();
}

function logicStep() {
  player.x += player.dx;
  player.y += player.dy;
}

function drawStep() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawUser(player.x, player.y);
}

