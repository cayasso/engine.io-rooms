/**
 * Module dependencies.
 */

var Adapter = require('./adapter');
var Socket = require('./socket');

/**
 * Module exports.
 */

module.exports = Server;

/**
 * Socket class.
 *
 * @api private
 */

function Server(io, adapter) {
  if (!(this instanceof Server)) return new Server(io, adapter);
  this.io = io;
  this.adapter(adapter || new Adapter(this.io));
  this.bind();
  return this.io;
}

/**
 * Sets the edaptor for rooms.
 *
 * @param {Adapter} pathname
 * @return {Server|Adapter} self when setting or value when getting
 * @api public
 */

Server.prototype.adapter = function(v){
  if (!arguments.length) return this._adapter;
  this._adapter = v;
  return this;
};

/**
 * Bind server events.
 *
 * @param {Adapter} pathname
 * @return {Server} self
 * @api private
 */

Server.prototype.bind = function () {
  this.io.on('connection', this.onconnection.bind(this));
};

/**
 * Called upon connection.
 *
 * @param {Socket} conn
 * @return {Server} self
 * @api private
 */

Server.prototype.onconnection = function(conn) {
  if (conn.room) return this;
  new Socket(this, conn);
  return this;
};