var rooms = require('../../');
var http = require('http');
var engine = require('engine.io');
var client = require('engine.io-client');
var server = http.createServer();
var io = engine.attach(server);

// Add room functionality to io
io = rooms(io);

// Server stuff
io.on('connection', function(socket){

  // testing regular
  socket.on('message', function(data){

    // joining a room
    socket.join(data);

    // broadcasting to rooms
    if (data === 'me') {
      console.log('------- ------- -------');
      socket.room('room1 room2 room3 room4').send('- WELCOME -');
      socket.room('room4').send('- BIENVENIDOS -');
      socket.leave(data);
    }
  });
});

function setClient (room) {

  var socket = client('ws://localhost:8080');

  if (room === 'me') {
    setInterval(function(){
      socket.send(room);
    }, 1500);
  } else {
    socket.send(room);
  }

  // on message received
  socket.on('message', function (data) {
    console.log('MSG:', data, 'SOCK:', socket.id);
  });
}

// Set first client
setTimeout(function () {
  setClient('me');
}, 10);

// Set one more client
setTimeout(function () {
  setClient('room1');
}, 100);

// Set one more client
setTimeout(function () {
  setClient('room2');
}, 10);

// Set one more client
setTimeout(function () {
  setClient('room3');
}, 10);

// Set one more client
setTimeout(function () {
  setClient('room4');
}, 10);

// Set one more client
setTimeout(function () {
  setClient('room1');
}, 10);

server.listen(process.env.PORT || 8080, function(){
  console.log('\033[96mlistening on localhost:9000 \033[39m');
});
