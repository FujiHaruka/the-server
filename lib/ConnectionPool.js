/**
 * Client connection store for the-server
 * @class ConnectionPool
 */
'use strict'

const {EventEmitter} = require('events')

class Connection extends EventEmitter {
  constructor () {
    super()
    const s = this
    s.controllers = {}
  }

  getController (name) {
    const s = this
    return s.controllers[name]
  }

  loadController (name, instance) {
    const s = this
    s.emit('load', {name})
    s.controllers[name] = instance
    if (instance.controllerDidLoad) {
      console.warn('[TheServer] `.controllerDidLoad() is deprecated. Use `.controllerDidAttach()` instead ')
      instance.controllerDidLoad()
    }
    instance.controllerDidAttach && instance.controllerDidAttach()
  }

  unloadController (name) {
    const s = this
    s.emit('unload', {name})
    const instance = s.controllers[name]
    if (!instance) {
      return
    }
    if (instance.controllerWillUnload) {
      console.warn('[TheServer] `.controllerWillUnload() is deprecated. Use `.controllerWillDetach()` instead ')
      instance.controllerWillUnload()
    }
    instance.controllerWillDetach && instance.controllerWillDetach()
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
