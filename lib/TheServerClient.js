/**
 * Client representation on serverside
 * @class TheServerClient
 */
'use strict'

const uuid = require('uuid')

const newKey = () => uuid.v4()

/** @lends TheServerClient */
class TheServerClient {
  constructor (key = newKey(), options = {}) {
    let {
      lifetime = 24 * 60 * 60 * 1000
    } = options
    const s = this
    s.key = key
    s.controllers = {}
    s.lifetime = lifetime
    s.at = new Date()
  }

  /**
   * Get a controller instance
   * @param {string} name - Name of controller
   * @returns {?Object} Controller instance
   */
  getController (name) {
    const s = this
    return s.controllers[ name ]
  }

  /**
   * Set a controller instance
   * @param {string} name - Name of controller
   * @param {Object} controller - Controller instance
   */
  setController (name, controller) {
    const s = this
    if (s.controllers[ name ]) {
      throw new Error(`Controller already registered with name: "${controller}"`)
    }
    s.controllers[ name ] = controller
  }

  /**
   * Keep alive
   */
  keepAlive () {
    const s = this
    s.at = new Date()
    return s
  }

  get alive () {
    const s = this
    let { at, lifetime } = s
    let dieAt = at.getTime() + lifetime
    return new Date().getTime() < dieAt
  }
}

Object.assign(TheServerClient, {
  newKey
})

module.exports = TheServerClient
