var socketioJwt = require('socketio-jwt');
var http = require('http');
var socketIo = require('socket.io');
var appConfig = require('./app');
var redis = require('redis');

var app = appConfig.app;
var pubClient = appConfig.pubClient;
var storeClient = appConfig.storeClient;

var server = http.createServer(app);
var io = socketIo(server);

// web sockets
io.use(socketioJwt.authorize({
  secret: process.env.JWT_SECRET,
  handshake: true
}));

io.on('connection', function(socket) {
  var subClient = redis.createClient();
  var token = socket.decoded_token;
  console.log(token.username + ' connected');

  // update current users
  storeClient.incr('users.num', (err, num) => {
    console.log('Online users: ' + num);
  });
  storeClient.rpush('users.list', token.username);
  
  // subscribe to chat messages from redis
  subClient.subscribe('chats');
  subClient.on('message', (channel, message) => {
    socket.emit('chat', message);
  });

  // publish new chats
  socket.on('chat', function(msg) {
    console.log(token.username + ': ' + msg);
    pubClient.publish('chats', token.username + ': ' + msg);
  });

  socket.on('disconnect', function() {
    console.log(token.username + ' disconnected');
    storeClient.lpop('users.list', (err, user) => {
      console.log('User ' + user + ' disconnected.');
    });
    storeClient.decr('users.num', (err, num) => {
      console.log('Online users: ' + num);
    });
    subClient.quit();
    pubClient.publish('chats', token.username + ' disconnected.');
  });
});

// create server
var port = process.env.PORT;
server.listen(port);
