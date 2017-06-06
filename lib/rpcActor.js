/**
 * Define an actor for rpc
 * @function rpcActor
 * @param {Object} scope - Scope variables
 * @param {Object.<string, function>} creators - Object creators
 * @returns {SugoActor} - A sugo actor instance
 */
'use strict'

const co = require('co')
const { SugoActor } = require('sugo-actor')
const { Module } = require('sugo-module-base')
const { bound, scoped } = require('sugo-module-scoped')
const { CallerEvents } = require('sugo-constants')
const { JOIN, LEAVE } = CallerEvents

class RpcActor extends SugoActor {
  constructor ({ scope, onClientJoin, onClientLeave }) {
    super({
      modules: {
        // Predefined module
        the: new Module({})
      }
    })
    const s = this
    s.scope = scope
    s.registeredModules = {}

    s.on(JOIN, ({ caller, messages }) => {
      let { key: callerKey } = caller
      let { scope } = messages || {}
      onClientJoin && onClientJoin(callerKey, scope)
    })

    s.on(JOIN, ({ caller, messages }) => {
      let { key: callerKey } = caller
      let { scope } = messages || {}
      onClientLeave && onClientLeave(callerKey, scope)
    })
  }

  register (creator, as) {
    const s = this
    let { scope } = s
    let scopedModule = scoped(creator, {
      defaults: [ scope ]
    })
    s.registeredModules[ as ] = bound(scopedModule, scope)
  }

  connect () {
    const s = this
    return super.connect().then((result) => co(function * () {
      let { registeredModules } = s
      for (let name of Object.keys(registeredModules)) {
        yield s.load(name, registeredModules[ name ])
      }
      return result
    }))
  }
}

module.exports = (scope, { onClientJoin, onClientLeave } = {}) => new RpcActor({ scope, onClientJoin, onClientLeave })
