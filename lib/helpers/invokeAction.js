/**
 * Invoke an action
 * @function invokeAction
 * @param {Object} invocation
 * @param {Object} [options={}] - Optional settings
 * @returns {Promise}
 */
'use strict'

/** @lends invokeAction */
async function invokeAction (invocation, options = {}) {
  const {before, after, rescue} = options
  if (before) {
    await Promise.resolve(before(invocation))
  }

  try {
    invocation.result = await Promise.resolve(
      invocation.target[invocation.action](...invocation.params)
    )
  } catch (error) {
    invocation.error = error
    if (rescue) {
      await Promise.resolve(rescue(invocation))
    }
    if (invocation.error) {
      const {message} = invocation.error
      if (message) {
        invocation.error.message = `\`${invocation.target.name}.${invocation.action}()\` ${message}`
      }
      delete invocation.error.stack
      throw invocation.error
    }
  }

  if (after) {
    await Promise.resolve(after(invocation))
  }

  return invocation.result
}

module.exports = invokeAction
