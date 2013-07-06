# Primus Rooms

[![Build Status](https://travis-ci.org/cayasso/primus-rooms.png?branch=master)](https://travis-ci.org/cayasso/primus-rooms)
[![NPM version](https://badge.fury.io/js/primus-rooms.png)](http://badge.fury.io/js/primus-rooms)

Node.JS module that adds room capabilities to a [Primus](https://github.com/3rd-Eden/primus) server.

## Instalation

```
npm install primus-rooms
```

## Usage

### On the Server

```
var primus = require('primus');
var PrimusRooms = require('primus-rooms');
var server = require('http').createServer();

// add rooms to Primus
PrimusRooms(Primus);

var primus = new Primus(server, { transformer: 'websockets', parser: 'JSON' });

primus.on('connection', function (spark) {

  // joining room1 & room2
  spark.join('room1');
  spark.join('room2');
  spark.join('room3');

  // leaving room room2
  spark.leave('room2');

  // get rooms I am connected to
  var myRooms = spark.rooms();
  console.log(myRooms); // ['room1', 'room3']

  // send data to room1
  spark.room('room1').write('hi');

  // send data to room1 & room3
  spark.room('room1 room3').write('hi');

  // get clients connected to room1
  spark.room('room1').clients(function(clients) {
    console.log(clients); // output array of spark ids
  });

  // leaving all rooms
  spark.leaveAll();

  // join rooms on request
  spark.on('message', function(room) {
    spark.join(room);
  });

});

server.listen(8080);
```

### On the Client

```
var socket = eio('ws://localhost');
socket.onopen = function(){

  // Join the news room
  socket.write('news');
};

```

## Run tests

```
make test
```

## License

(The MIT License)

Copyright (c) 2013 Jonathan Brumley &lt;cayasso@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
