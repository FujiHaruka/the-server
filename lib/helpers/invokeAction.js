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
    const {action, params, target} = invocation
    if (target.controllerMethodWillInvoke) {
      await target.controllerMethodWillInvoke({name: action, params})
    }
    invocation.result = await Promise.resolve(
      target[action](...params)
    )
    if (target.controllerMethodDidInvoke) {
      await target.controllerMethodDidInvoke({name: action, params, result: invocation.result})
    }
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
