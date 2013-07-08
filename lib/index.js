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
 * Server class.
 *
 * @api private
 */

function Server(io, opts) {
  if (!(this instanceof Server)) return new Server(io, opts);
  opts = opts || {};
  this.io = io;
  this.adapter(opts.adapter || new Adapter(this.io));
  this.bind();
  return this.io;
}

/**
 * Sets the adapter for rooms.
 *
 * @param {Adapter} adapter
 * @return {Server|Adapter} self when setting or value when getting
 * @api public
 */

Server.prototype.adapter = function(adapter){
  if (!arguments.length) return this._adapter;
  this._adapter = adapter;
  return this;
};

/**
 * Bind server events.
 *
 * @return {Server} self
 * @api private
 */

Server.prototype.bind = function () {
  this.io.adapter = this.adapter.bind(this);
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