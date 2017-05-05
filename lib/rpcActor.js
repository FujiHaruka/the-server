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

class RpcActor extends SugoActor {
  constructor ({ scope }) {
    super({
      modules: {
        // Predefined module
        the: new Module({})
      }
    })
    const s = this
    s.scope = scope
    s.registeredModules = {}
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
    return super.connect().then((result) => co(function* () {
      let { registeredModules } = s
      for (let name of Object.keys(registeredModules)) {
        yield s.load(name, registeredModules[ name ])
      }
      return result
    }))
  }
}

module.exports = (scope) => new RpcActor({ scope })
