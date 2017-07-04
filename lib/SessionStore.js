/**
 * Client session store for the-server
 * @class SessionStore
 */
'use strict'

const co = require('co')
const asleep = require('asleep')
const SESSION_STORE_KEY = 'the:session'
const DEFAULT_EXPIRE_DURATION = 24 * 60 * 60 * 1000
const DEFAULT_CLEANUP_INTERVAL = 30 * 60 * 1000

/** @lends SessionStore */
class SessionStore {
  constructor (storage, options = {}) {
    let {
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
   * Get session data
   * @param {string} cid - Client id
   * @returns {Promise.<Object>}
   */
  get (cid) {
    const s = this
    const { storage } = s
    return co(function * () {
      let found = yield storage.hget(SESSION_STORE_KEY, cid)
      if (!found) {
        return null
      }
      let { data, expiredAt } = JSON.parse(found)
      let expired = new Date(expiredAt) < new Date()
      return expired ? null : data
    })
  }

  /**
   * Set session data
   * @param {string} cid - Client id
   * @param {Object} data - Data to set
   * @returns {Promise.<void>}
   */
  set (cid, data) {
    const s = this
    const { storage, expireDuration } = s
    return co(function * () {
      let expiredAt = new Date().getTime() + expireDuration
      yield storage.hset(SESSION_STORE_KEY, cid, JSON.stringify({
        cid, data, expiredAt
      }))
    })
  }

  /**
   * Check if has session
   * @param {string} cid - Client id
   * @returns {Promise.<boolean>}
   */
  has (cid) {
    const s = this
    return co(function * () {
      return !!(yield s.get(cid))
    })
  }

  /**
   * Cleanup expired sessions
   * @returns {Promise.<string[]>}
   */
  cleanup () {
    const s = this
    const { storage } = s
    return co(function * () {
      let deleted = []
      if (s._cleaning) {
        return deleted
      }
      s._cleaning = true
      for (let cid of yield storage.hkeys(SESSION_STORE_KEY)) {
        let has = yield s.has(cid)
        if (!has) {
          yield storage.hdel(SESSION_STORE_KEY, cid)
          deleted.push(cid)
        }
      }
      s._cleaning = false
      return deleted
    })
  }
}

module.exports = SessionStore
