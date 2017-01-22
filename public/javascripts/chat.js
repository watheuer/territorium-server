var socket;
var gameLoop;
var connected = false;
var players = new Map();
var name;
var currentPlayer;

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

    currentPlayer = {
      username: name,
      x: 50.0,
      y: 50.0,
      dx: 0.0,
      dy: 0.0
    };

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

  // update player
  socket.on('player_update', function(player) {
    players.set(player.username, player);
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
    name = username;
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
      currentPlayer.dy = -yVelocity;
      break;
    case 83: //s
      currentPlayer.dy = yVelocity;
      break;
    case 68: //d
      currentPlayer.dx = xVelocity;
      break;
    case 65: //a
      currentPlayer.dx = -xVelocity;
      break;
  }
}

function keyUp(e) {
  switch(e.keyCode) {
    case 87: //w
      currentPlayer.dy = 0.0;
      break;
    case 83: //s
      currentPlayer.dy = 0.0;
      break;
    case 68: //d
      currentPlayer.dx = 0.0;
      break;
    case 65: //a
      currentPlayer.dx = 0.0;
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
  currentPlayer.x += currentPlayer.dx;
  currentPlayer.y += currentPlayer.dy;
  socket.emit('player_update', currentPlayer);  // emit currentPlayer location
}

function drawStep() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  players.forEach(function(player, id) {
    drawUser(player.x, player.y);
  });
}

