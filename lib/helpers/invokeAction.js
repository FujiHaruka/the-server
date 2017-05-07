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

    try {
      invocation.result = yield Promise.resolve(
        invocation.target[ invocation.action ](...invocation.params)
      )
    } catch (error) {
      invocation.error = error
      if (rescue) {
        yield Promise.resolve(rescue(invocation))
      }
      if (invocation.error) {
        throw invocation.error
      }
    }

    if (after) {
      yield Promise.resolve(after(invocation))
    }

    return invocation.result
  })
}

module.exports = invokeAction
