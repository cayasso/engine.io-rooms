# Engine.IO Rooms

[![Build Status](https://travis-ci.org/cayasso/engine.io-rooms.png?branch=master)](https://travis-ci.org/cayasso/engine.io-rooms)
[![NPM version](https://badge.fury.io/js/engine.io-rooms.png)](http://badge.fury.io/js/engine.io-rooms)

Node.JS module, that adds room capabilities to an Engine.IO server.

## Instalation

```
npm install engine.io-rooms
```

## Usage

#### On the Server

```
var Rooms = require('engine.io-rooms');
var engine = require('engine.io');
var server = require('http').createServer();
var io = engine(server);

// add rooms to eio
io = Rooms(io);

io.on('connection', function (socket) {

  // joining room1 & room2
  socket.join('room1');
  socket.join('room2');
  socket.join('room3');

  // leaving room room2
  socket.leave('room2');

  // get rooms I am connected to
  var myRooms = socket.rooms();
  console.log(myRooms); // ['room1', 'room3']

  // send data to room1
  socket.room('room1').send('hi');

  // send data to room1 & room3
  socket.room('room1 room3').send('hi');

  // get clients connected to room1
  socket.room('room1').clients(function(clients) {
    console.log(clients); // output array of socket ids
  });

  // leaving all rooms
  socket.leaveAll();

  // join rooms on request
  socket.on('message', function(room) {
    socket.join(room);
  });

});

server.listen(8080);
```

#### On the Client

```
var socket = eio('ws://localhost');
socket.onopen = function(){

  // Join the news room
  socket.send('news');
};

```

## API

### Rooms(io, [options])

Add rooms functionality to `engine.io` server instance. 
The options parameter is optional.

```
Rooms(io);

// or do with a custom adapter
Rooms(io, { adapter: MyAdapter });
```

Options are:

`options.adapter`

### Rooms#adapter(Adapter)

Set your own `adapter` for rooms, by default `engine.io-rooms` comes 
with its own `memory` adapter but its easy to provide a custom one.

```
Rooms(io);

// set to my own adapter
Rooms.adapter(MyAdapter);
```

### socket#join(name, [fn])

Join client to a `room`, `fn` is optional callback.

```
socket.join('room');
```

Join multiple rooms at once.

```
socket.join('room1 room2 room3', fn);
```

### socket#room(name, [fn])

Target a specific `room`.

```
socket.room('room').send('hi');
socket.room('room').clients();
```

### socket#room#send(message)

Send a message to a specific `room`.

```
socket.room('room').send('hi');
```

### socket#room#clients()

Get all clients `id` connected to specific `room`.

```
socket.room('room').clients();
```

### socket#leave(name)

Leave a specific `room`.

```
socket.leave('room');
```

Leave multiple rooms at once.

```
socket.leave('room1 room2 room3');
```

### socket#leaveAll()

Leave all rooms the client has joined.

```
socket.leaveAll();
```

### socket#rooms()

Get all the rooms client is connected to.

```
socket.rooms();
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
