/**
 * Create a TheServer instance
 * @function create
 * @param {...*} args
 * @returns {TheServer}
 */
'use strict'

import TheServer from './TheServer'

/** @lends create */
function create (...args) {
  return new TheServer(...args)
}

export default create
