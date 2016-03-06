
var rooms = require('../index');
var eio = require('engine.io');
var ioc = require('engine.io-client');
var http = require('http').Server;
var expect = require('expect.js');

// creates a conn.io client for the given server
function client(srv){
  var addr = srv.address();

  // Host `::` is a valid IPv6 host.
  // engine.io-client is not parsing `::` as a host.
  // To fix this issue, we have to use `localhost`.
  if (addr.address === '::') {
    addr.address = 'localhost';
  }

  var url = 'ws://' + addr.address + ':' + addr.port;
  return ioc(url);
}

describe('engine.io-rooms', function () {

  it('should have required methods', function(done){
    var srv = http();
    var io = rooms(eio(srv));
    srv.listen(function(){      
      io.on('connection', function (conn) {
        expect(conn.join).to.be.a('function');
        expect(conn.leave).to.be.a('function');
        expect(conn.leaveAll).to.be.a('function');
        expect(conn.room).to.be.a('function');
        done();
      });
      client(srv);
    });
  });

  it('should join room', function(done){
    var srv = http();
    var io = rooms(eio(srv));
    srv.listen(function(){      
      io.on('connection', function(conn){
        conn.join('room1');
        conn.room('room1').clients(function (err, clients) {
          expect(!!~clients.indexOf(conn.id)).to.be.ok();
          done();
        });
      });
      client(srv);
    });
  });

  it('should join multiple rooms at once', function(done){
    var srv = http();
    var io = rooms(eio(srv));
    srv.listen(function(){      
      io.on('connection', function(conn){
        conn.join('room1 room2 room3', function(){
          conn.room('room1').clients(function (err, clients) {
            expect(!!~clients.indexOf(conn.id)).to.be.ok();
            conn.room('room2').clients(function (err, clients) {
              expect(!!~clients.indexOf(conn.id)).to.be.ok();
              conn.room('room3').clients(function (err, clients) {
                expect(!!~clients.indexOf(conn.id)).to.be.ok();
                done();
              });
            });
          });
        });    
      });
      client(srv);
    });
  });

  it('should join multiple rooms at once passing an array as argument', function(done){
    var srv = http();
    var io = rooms(eio(srv));
    srv.listen(function(){
      io.on('connection', function(conn){
        conn.join(['room1', 'room2', 'room3'], function(){
          conn.room('room1').clients(function (err, clients) {
            expect(!!~clients.indexOf(conn.id)).to.be.ok();
            conn.room('room2').clients(function (err, clients) {
              expect(!!~clients.indexOf(conn.id)).to.be.ok();
              conn.room('room3').clients(function (err, clients) {
                expect(!!~clients.indexOf(conn.id)).to.be.ok();
                done();
              });
            });
          });
        });
      });
      client(srv);
    });
  });

  it('should get all rooms client is connected to', function(done){
    var srv = http();
    var io = rooms(eio(srv));
    srv.listen(function(){
      io.on('connection', function(conn){
        conn.join('room1 room2 room3', function () {          
          expect(conn.rooms()).to.eql(['room1', 'room2', 'room3']);
          done();
        });       
      });
      client(srv);
    });
  });

  it('should leave room', function(done){
    var srv = http();
    var io = rooms(eio(srv));
    srv.listen(function(){
      io.on('connection', function(conn){
        conn.join('room1');
        conn.leave('room1');
        conn.room('room1').clients(function (err, clients) {
          expect(!!~clients.indexOf(conn.id)).to.be(false);
          done();
        });
      });
      client(srv);
    });
  });

  it('should leave multiple rooms at once', function(done){
    var srv = http();
    var io = rooms(eio(srv));
    srv.listen(function(){      
      io.on('connection', function(conn){
        conn.join('room1 room2 room3 room4', function () {
          conn.leave('room1 room2 room3', function(){
            expect(conn.rooms()).to.eql(['room4']);
            done();
          });
        });       
      });
      client(srv);
    });
  });

  it('should leave multiple rooms at once passing an array', function(done){
    var srv = http();
    var io = rooms(eio(srv));
    srv.listen(function(){      
      io.on('connection', function(conn){
        conn.join('room1 room2 room3 room4', function () {
          conn.leave(['room1', 'room2', 'room3'], function(){
            expect(conn.rooms()).to.be.eql(['room4']);
            done();
          });
        });
      });
      client(srv);
    });
  });

  it('should leave all rooms', function(done){
    var srv = http();
    var io = rooms(eio(srv));
    srv.listen(function(){      
      io.on('connection', function(conn){
        conn.join('room1');
        conn.join('room2');
        conn.join('room3');
        conn.leaveAll();
        expect(conn.rooms()).to.be.eql([]);
        done();
      });
      client(srv);
    });
  });

  it('should allow method channing', function(done){
    var srv = http();
    var io = rooms(eio(srv));
    srv.listen(function(){      
      io.on('connection', function(conn){
        conn
        .join('room1')
        .join('room2')
        .join('room3')
        .leave('room1')
        .leave('room2')
        .leave('room3')
        .room('room1')
        .clients(function (err, clients) {
          expect(!!~clients.indexOf(conn.id)).to.eql(false);
          done();
        });
      });
      client(srv);
    });
  });

  it('should allow sending to multiple rooms', function(done){
    var srv = http();
    var io = rooms(eio(srv));
    var total = 3;
    srv.listen(function(){

      var c1 = client(srv);
      var c2 = client(srv);
      var c3 = client(srv);
      var c4 = client(srv);
      var c5 = client(srv);

      io.on('connection', function(conn){
        conn.on('message', function (data) {
          conn.join(data);
          if (data === 'send') {
            conn.leave('send');
            conn.room('room1 room2 room3 room4').send('a');
          }
        });
      });

      c1.on('message', function (data) {
        done(new Error('not'));
      });

      c2.on('message', function (data) {
        --total || done();
      });

      c3.on('message', function (data) {
        --total || done();
      });

      c4.on('message', function (data) {
        --total || done();
      });

      c5.on('message', function (data) {
        done(new Error('not'));
      });

      c1.send('room1');
      c2.send('room1');
      c2.send('room2');
      c3.send('room3');
      c4.send('room4');
      c5.send('room5');

      // need to add a small delay
      setTimeout(function () {
        c1.send('send');
      }, 500);

    });
  });

  it('should avoid sending dupes', function(done){
    var srv = http();
    var io = rooms(eio(srv));
    var total = 2;

    srv.listen(function(){      
      io.on('connection', function(conn){
        conn.join('room1');
        conn.join('room2');
        conn.join('room3');
        conn.join('room4');
        conn.on('message', function (data) {
          if (data === 'send') {
            conn.room('room1 room2 room3').send('a');
          }
        });
      });
      var c1 = client(srv);
      var c2 = client(srv);
      var c3 = client(srv);

      c2.on('message', function (data) {
        expect('a' === data);
        --total || done();
      });

      c3.on('message', function (data) {
        expect('a' === data);
        --total || done();
      });

      c1.send('send');
    });
  });

  it('should get all client ids connected to a room', function(done){
    var srv = http();
    var io = rooms(eio(srv));
    var ids = [];
    srv.listen(function(){      
      io.on('connection', function(conn){
        ids.push(conn.id);
        conn.join('room1');
        conn.on('message', function (){
          conn.room('room1').clients(function (err, clients) {
            expect(clients).to.be.eql(ids);
            done();
          });
        });
      });
      client(srv);
      client(srv);
      client(srv);
      client(srv)
      .send('send');
    });
  });

  it('should keeps track of rooms', function(done){
    var srv = http();
    var io = rooms(eio(srv));
    srv.listen(function(){
      var conn = client(srv);
      io.on('connection', function(s){
        s.join('a', function(){
          expect(s.rooms()).to.eql(['a']);
          s.join('b', function(){
            expect(s.rooms()).to.eql(['a', 'b']);
            s.leave('b', function(){
              expect(s.rooms()).to.eql(['a']);
              done();
            });
          });
        });
      });
    });
  });
});
