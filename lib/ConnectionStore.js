/**
 * Client connection store for the-server
 * @class ConnectionStore
 */
'use strict'

const {EventEmitter} = require('events')
const CONNECTION_STORE_KEY = 'the:server:connection'
const DEFAULT_EXPIRE_DURATION = 24 * 60 * 60 * 1000
const DEFAULT_CLEANUP_INTERVAL = 30 * 60 * 1000

/** @lends ConnectionStore */
class ConnectionStore extends EventEmitter {
  constructor (storage, options = {}) {
    super()
    const {
      expireDuration = DEFAULT_EXPIRE_DURATION,
      cleanupInterval = DEFAULT_CLEANUP_INTERVAL
    } = options
    const s = this
    s.storage = storage
    s.expireDuration = expireDuration
    s._cleaning = false

    s.cleanup()

    setInterval(() => s.cleanup(), cleanupInterval).unref()
  }

  /**
   * Get connection data
   * @param {string} callerKey - Key of caller
   * @returns {Promise.<Object>}
   */
  async get (callerKey) {
    const s = this
    const {storage} = s
    let found = await storage.hget(CONNECTION_STORE_KEY, callerKey)
    if (!found) {
      return null
    }
    let {data, expiredAt} = JSON.parse(found)
    let expired = new Date(expiredAt) < new Date()
    return expired ? null : data
  }

  /**
   * Set connection data
   * @param {string} callerKey - Key of caller
   * @param {Object} data - Data to set
   * @returns {Promise.<void>}
   */
  async set (callerKey, data) {
    const s = this
    const {storage, expireDuration} = s
    let expiredAt = new Date().getTime() + expireDuration
    await storage.hset(CONNECTION_STORE_KEY, callerKey, JSON.stringify({
      callerKey, data, expiredAt
    }))
  }

  /**
   * Check if has connection
   * @param {string} callerKey - Key of caller
   * @returns {Promise.<boolean>}
   */
  async has (callerKey) {
    const s = this
    return !!(await s.get(callerKey))
  }

  /**
   * Delete caller
   * @param callerKey
   * @returns {*}
   */
  async del (callerKey) {
    const s = this
    const {storage} = s
    return await storage.hdel(CONNECTION_STORE_KEY, callerKey)
  }

  /**
   * Cleanup expired connections
   * @returns {Promise.<string[]>}
   */
  async cleanup () {
    const s = this
    const {storage} = s
    let deleted = []
    if (s._cleaning) {
      return deleted
    }
    s._cleaning = true
    for (let callerKey of await storage.hkeys(CONNECTION_STORE_KEY)) {
      let has = await s.has(callerKey)
      if (!has) {
        await storage.hdel(CONNECTION_STORE_KEY, callerKey)
        deleted.push(callerKey)
      }
    }
    s._cleaning = false
    return deleted
  }
}

module.exports = ConnectionStore
