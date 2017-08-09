/**
 * Client connection store for the-server
 * @class ConnectionPool
 */
'use strict'

class Connection {
  constructor () {
    const s = this
    s.controllers = {}
  }

  getController (name) {
    const s = this
    return s.controllers[name]
  }

  loadController (name, instance) {
    const s = this

    s.controllers[name] = instance
    instance.controllerDidLoad && instance.controllerDidLoad()
  }

  unloadController (name) {
    const s = this
    const instance = s.controllers[name]
    instance.controllerWillUnload && instance.controllerWillUnload()
    delete s.controllers[name]
  }

  unloadAllControllers () {
    const s = this
    for (const name of Object.keys(s.controllers)) {
      s.unloadController(name)
    }
  }
}

/** @lends ConnectionPool */
class ConnectionPool {
  constructor () {
    const s = this
    s.connections = {}
  }

  getConnection (callerKey) {
    const s = this
    const connection = s.connections[callerKey]
    if (!connection) {
      throw new Error(`Connection not found for caller: "${callerKey}"`)
    }
    return connection
  }

  createConnection (callerKey) {
    const s = this
    s.connections[callerKey] = new Connection()
  }

  destroyConnection (callerKey) {
    const s = this
    const connection = s.connections[callerKey]
    if (connection) {
      connection.unloadAllControllers()
    }
    delete s.connections[callerKey]
  }

  destroyAllConnections () {
    const s = this
    for (const callerKey of Object.keys(s.connections)) {
      s.destroyConnection(callerKey)
    }
  }
}

module.exports = ConnectionPool
