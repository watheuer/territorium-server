var socketioJwt = require('socketio-jwt');
var http = require('http');
var socketIo = require('socket.io');
var app = require('./app');
var redis = require('redis');
var redisConfig = require('./redisConfig');

var pubClient = redisConfig.pubClient;
var storeClient = redisConfig.storeClient;

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
  storeClient.sadd('users.set', token.username);
  
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
    // remove from set of online users
    storeClient.srem('users.set', token.username, (err, ret) => {
      if (ret) {
        console.log(token.username + ' disconnected.');
        storeClient.decr('users.num', (err, num) => {
          console.log('Online users: ' + num);
        });
      } else {
        console.error(token.username + ' disconnected without being logged in.');
      }
    });

    // end subscriber client
    subClient.quit();
    pubClient.publish('chats', token.username + ' disconnected.');
  });

  socket.on('player_update', function(player) {
    io.sockets.emit('player_update', player);
  });
});

// create server
var port = process.env.PORT;
server.listen(port);
