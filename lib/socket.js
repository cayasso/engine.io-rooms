/**
 * Module dependencies.
 */

var debug = require('debug')('rooms:socket')
  , isArray = require('util').isArray;

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Function placeholder.
 */

var noop = function () {};

/**
 * Socket class.
 *
 * @api private
 */

function Socket (server, conn) {
  if (!(this instanceof Socket)) return new Socket(server, conn);
  this._rooms = [];
  this.server = server;
  this.adapter = server.adapter();
  this.conn = conn;
  this.bind();
}

/**
 * Bind room events.
 *
 * @return {Socket} self
 * @api private
 */

Socket.prototype.bind = function () {
  this.conn.rooms = this.rooms.bind(this);
  this.conn.room = this.room.bind(this);
  this.conn.join = this.join.bind(this);
  this.conn.leave = this.leave.bind(this);
  this.conn.leaveAll = this.leaveAll.bind(this);
  this.conn.on('close', this.leaveAll.bind(this));
  return this;
};

/**
 * Send data.
 *
 * @param {Object} data
 * @return {Socket} self
 * @api public
 */

Socket.prototype.send = function (name, data) {
  if (this._rooms && this._rooms.length) {
    var rooms = [];
    if (isArray(name)) rooms = name;
    if ('string' === typeof name) rooms = name.split(' ');
    this.adapter.broadcast(data, {
      except: [this.conn.id],
      rooms: name ? rooms : this._rooms
    });
  }
};

/**
 * Get connected clients.
 *
 * @param {String} name
 * @param {Function} optional, callback
 * @return {Array} array of clients
 * @api public
 */

Socket.prototype.clients = function (name, fn) {
  return this.adapter.clients(name, fn);
};

/**
 * Joins a room.
 *
 * @param {String|Array} room
 * @param {Function} fn callback
 * @return {Socket} self
 * @api public
 */

Socket.prototype.join = function(room, fn){
  return this.exec('_join', room, fn);
};

/**
 * Do the actual join.
 *
 * @param {String} room
 * @param {Function} optional, callback
 * @return {Socket} self
 * @api private
 */

Socket.prototype._join = function (room, fn) {
  debug('joining room %s', room);
  if (~this._rooms.indexOf(room)) return this;
  this.adapter.add(this.conn.id, room, function(err){
    if (err) return fn && fn(err);
    debug('joined room %s', room);
    this._rooms.push(room);
    fn && fn(null);
  }.bind(this));
  return this;
};

/**
 * Leaves a room.
 *
 * @param {String} room
 * @param {Function} fn callback
 * @return {Socket} self
 * @api public
 */

Socket.prototype.leave = function (room, fn) {
  return this.exec('_leave', room, fn);
};

/**
 * Leaves a room.
 *
 * @param {String} room
 * @param {Function} fn callback
 * @return {Socket} self
 * @api private
 */

Socket.prototype._leave = function(room, fn){
  debug('leave room %s', room);
  this.adapter.del(this.conn.id, room, function(err){
    if (err) return fn && fn(err);
    debug('left room %s', room);
    var pos = this._rooms.indexOf(room);
    if (~pos) this._rooms.splice(pos, 1);
    fn && fn(null);
  }.bind(this));
  return this;
};

/**
 * Targets a room when broadcasting.
 *
 * @param {String} name
 * @return {Object} name spaces
 * @api public
 */

Socket.prototype.room = function(name){
  this._rooms = this._rooms || [];
  if (!~this._rooms.indexOf(name)) this._rooms.push(name);
  return {
    send: this.send.bind(this, name),
    clients: this.clients.bind(this, name)
  };
};

/**
 * Get all rooms for this client.
 *
 * @param {String} name
 * @return {Array} array of rooms
 * @api public
 */

Socket.prototype.rooms = function(name){
  return this._rooms;
};

/**
 * Leave all rooms.
 *
 * @api public
 */

Socket.prototype.leaveAll = function(){
  this._rooms = [];
  this.adapter.delAll(this.conn.id);
  return this;
};

/**
 * Execute a specific method were a 
 * string or array is provided.
 *
 * @param {String} method method to execute
 * @param {String|Array} room
 * @param {Function} fn, callback
 * @return {Socket} self
 * @api private
 */

Socket.prototype.exec = function(method, room, fn){

  var rooms = room, l, errs = [], count = 0;

  if ('string' === typeof room) {
    rooms = room.split(' ');
    if (rooms.length <= 1) {
      return this[method](rooms[0], fn);
    }
  }

  l = rooms.length;

  for (var i = 0; i < l; ++i) {
    this[method](rooms[i], cb);
  }

  function cb(err) {
    errs.push(err); count++;
    if (count === l && fn) {
      fn.apply(null, errs);
    }
  }

  return this;
};