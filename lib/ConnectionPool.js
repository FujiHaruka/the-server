/**
 * Client connection store for the-server
 * @class ConnectionPool
 */
'use strict'

const {EventEmitter} = require('events')

class Connection extends EventEmitter {
  constructor () {
    super()
    this.controllers = {}
  }

  getController (name) {
    return this.controllers[name]
  }

  loadController (name, instance) {
    this.emit('load', {name})
    this.controllers[name] = instance
    instance.controllerDidAttach && instance.controllerDidAttach()
  }

  unloadController (name) {
    this.emit('unload', {name})
    const instance = this.controllers[name]
    if (!instance) {
      return
    }
    instance.controllerWillDetach && instance.controllerWillDetach()
    delete this.controllers[name]
  }

  unloadAllControllers () {
    for (const name of Object.keys(this.controllers)) {
      this.unloadController(name)
    }
  }
}

/** @lends ConnectionPool */
class ConnectionPool {
  constructor () {
    this.connections = {}
  }

  getConnection (callerKey) {
    const connection = this.connections[callerKey]
    if (!connection) {
      throw new Error(`Connection not found for caller: "${callerKey}"`)
    }
    return connection
  }

  createConnection (callerKey) {
    this.connections[callerKey] = new Connection()
  }

  destroyConnection (callerKey) {
    const connection = this.connections[callerKey]
    if (connection) {
      connection.unloadAllControllers()
    }
    delete this.connections[callerKey]
  }

  destroyAllConnections () {
    for (const callerKey of Object.keys(this.connections)) {
      this.destroyConnection(callerKey)
    }
  }
}

module.exports = ConnectionPool
