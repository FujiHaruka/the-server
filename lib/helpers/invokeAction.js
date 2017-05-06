/**
 * Invoke an action
 * @function invokeAction
 * @param {Object} invocation
 * @param {Object} [options={}] - Optional settings
 * @returns {Promise}
 */
'use strict'

const co = require('co')

/** @lends invokeAction */
function invokeAction (invocation, options = {}) {
  let { before, after, rescue } = options
  return co(function * () {
    if (before) {
      yield Promise.resolve(before(invocation))
    }

    invocation.result = yield Promise.resolve(
      invocation.target[ invocation.action ](...invocation.params)
    )

    if (after) {
      yield Promise.resolve(after(invocation))
    }

    return invocation.result
  }).catch((error) => {
    invocation.error = error
    if (rescue) {
      rescue(invocation)
    }
    if (invocation.error) {
      return Promise.reject(invocation.error)
    }
  })
}

module.exports = invokeAction
