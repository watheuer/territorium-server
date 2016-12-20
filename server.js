var socketioJwt = require('socketio-jwt');
var http = require('http');
var socketIo = require('socket.io');

var app = require('./app');
var server = http.createServer(app);
var io = socketIo(server);

// web sockets
io.set('authorization', socketioJwt.authorize({
  secret: "lolnotreal",
  handshake: true
}));

io.on('connection', function(socket) {
  console.log("User connected");

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  socket.on('chat message', function(msg) {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
});

// create server
// var port = process.env.PORT;
var port = '3000';
server.listen(port);
