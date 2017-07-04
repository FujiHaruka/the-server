/**
 * Create callback proxy
 * @function callbacksProxy
 * @returns {Proxy}
 */
'use strict'

/** @lends callbacksProxy */
function callbacksProxy ({ emitter }) {
  const proxy = new Proxy({}, {
    get (target, name) {
      return function callbackProxy (...args) {
        emitter(name, args)
      }
    }
  })

  return proxy
}

module.exports = callbacksProxy
