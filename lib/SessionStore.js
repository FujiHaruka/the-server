/**
 * Client session store for the-server
 * @class SessionStore
 */
'use strict'

const SESSION_STORE_KEY = 'the:server:session'
const DEFAULT_EXPIRE_DURATION = 24 * 60 * 60 * 1000
const DEFAULT_CLEANUP_INTERVAL = 30 * 60 * 1000

/** @lends SessionStore */
class SessionStore {
  constructor (storage, options = {}) {
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
   * Get session data
   * @param {string} cid - Client id
   * @returns {Promise.<Object>}
   */
  async get (cid) {
    const s = this
    const {storage} = s
    let found = await storage.hget(SESSION_STORE_KEY, cid)
    if (!found) {
      return null
    }
    let {data, expiredAt} = JSON.parse(found)
    let expired = new Date(expiredAt) < new Date()
    return expired ? null : data
  }

  /**
   * Set session data
   * @param {string} cid - Client id
   * @param {Object} data - Data to set
   * @returns {Promise.<void>}
   */
  async set (cid, data) {
    const s = this
    const {storage, expireDuration} = s
    let expiredAt = new Date().getTime() + expireDuration
    await storage.hset(SESSION_STORE_KEY, cid, JSON.stringify({
      cid, data, expiredAt
    }))
  }

  /**
   * Check if has session
   * @param {string} cid - Client id
   * @returns {Promise.<boolean>}
   */
  async has (cid) {
    const s = this
    return !!(await s.get(cid))
  }

  /**
   * Cleanup expired sessions
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
    for (let cid of await storage.hkeys(SESSION_STORE_KEY)) {
      let has = await s.has(cid)
      if (!has) {
        await storage.hdel(SESSION_STORE_KEY, cid)
        deleted.push(cid)
      }
    }
    s._cleaning = false
    return deleted
  }
}

module.exports = SessionStore
