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
    this.storage = storage
    this.expireDuration = expireDuration
    this._cleaning = false

    this.cleanup()

    setInterval(this.cleanup.bind(this), cleanupInterval).unref()
  }

  /**
   * Get session data
   * @param {string} cid - Client id
   * @returns {Promise.<Object>}
   */
  async get (cid) {
    const {storage} = this
    const found = await storage.hget(SESSION_STORE_KEY, cid)
    if (!found) {
      return null
    }
    const {data, expiredAt} = JSON.parse(found)
    const expired = new Date(expiredAt) < new Date()
    return expired ? null : data
  }

  /**
   * Set session data
   * @param {string} cid - Client id
   * @param {Object} data - Data to set
   * @returns {Promise.<void>}
   */
  async set (cid, data) {
    const {storage, expireDuration} = this
    const expiredAt = new Date().getTime() + expireDuration
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
    return !!(await this.get(cid))
  }

  /**
   * Cleanup expired sessions
   * @returns {Promise.<string[]>}
   */
  async cleanup () {
    const {storage} = this
    const deleted = []
    if (this._cleaning) {
      return deleted
    }
    this._cleaning = true
    for (const cid of await storage.hkeys(SESSION_STORE_KEY)) {
      const has = await this.has(cid)
      if (!has) {
        await storage.hdel(SESSION_STORE_KEY, cid)
        deleted.push(cid)
      }
    }
    this._cleaning = false
    return deleted
  }
}

module.exports = SessionStore
