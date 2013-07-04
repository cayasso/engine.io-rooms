/**
 * Module dependencies.
 */

var debug = require('debug')('rooms:socket');

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
 * Send data.
 *
 * @param {Object} data
 * @param {Function} optional, callback
 * @return {Socket} self
 * @api public
 */

Socket.prototype.clients = function (name, fn) {
  return this.adapter.clients(name, fn);
};

/**
 * Joins a room.
 *
 * @param {String} room
 * @param {Function} optional, callback
 * @return {Socket} self
 * @api public
 */

Socket.prototype.join = function(room, fn){
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
 * @param {Function} optional, callback
 * @return {Socket} self
 * @api public
 */

Socket.prototype.leave = function(room, fn){
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
 * @return {Socket} self
 * @api public
 */

Socket.prototype.room = function(name){
  this._rooms = this._rooms || [];
  if (!~this._rooms.indexOf(name)) this._rooms.push(name);
  return {
    send: this.send.bind(this, name),
    clients: this.clients.bind(this, name),
    rooms: this.rooms.bind(this)
  };
};

/**
 * Targets a room when broadcasting.
 *
 * @param {String} name
 * @return {Socket} self
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
 * isArray helper.
 *
 * @param {Mixed} obj
 * @return {Boolean} self
 * @api public
 */

function isArray(obj) {
  var toString = Object.prototype.toString;
  return '[object Array]' === toString.call(obj);
}


