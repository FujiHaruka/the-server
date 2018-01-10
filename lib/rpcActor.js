/**
 * Define an actor for rpc
 * @function rpcActor
 * @param {Object} scope - Scope variables
 * @param {Object.<string, function>} creators - Object creators
 * @returns {SugoActor} - A sugo actor instance
 */
'use strict'

const {SugoActor} = require('sugo-actor')
const {Module} = require('sugo-module-base')
const {bound, scoped} = require('sugo-module-scoped')
const {CallerEvents} = require('sugo-constants')
const {JOIN, LEAVE} = CallerEvents

class RpcActor extends SugoActor {
  constructor ({scope, onClientJoin, onClientLeave}) {
    super({
      modules: {
        // Predefined module
        the: new Module({})
      }
    })
    this.scope = scope
    this.registeredModules = {}

    this.on(JOIN, (data) => {
      const {caller, messages} = data || {}
      const {key: callerKey} = caller
      const {scope} = messages || {}
      onClientJoin && onClientJoin(callerKey, scope)
    })

    this.on(LEAVE, (data) => {
      const {caller} = data || {}
      const {key: callerKey} = caller
      onClientLeave && onClientLeave(callerKey)
    })
  }

  /**
   * Register controller creator function
   * @param {function} creator - Creator function
   * @param {string} as - Name of controller module
   */
  register (creator, as) {
    const {scope} = this
    const scopedModule = scoped(creator, {
      defaults: [scope]
    })
    this.registeredModules[as] = bound(scopedModule, scope)
  }

  /**
   * Connect to hub
   * @returns {Promise}
   */
  async connect () {
    const result = await super.connect()
    const {registeredModules} = this
    for (const name of Object.keys(registeredModules)) {
      await this.load(name, registeredModules[name])
    }
    return result
  }
}

module.exports = (scope, {onClientJoin, onClientLeave} = {}) => new RpcActor({scope, onClientJoin, onClientLeave})
