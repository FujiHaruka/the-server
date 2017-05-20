/**
 * @function toLowerKeys
 */
'use strict'

/** @lends toLowerKeys */
function toLowerKeys (values = {}) {
  return Object.keys(values).reduce((result, name) => Object.assign(result, {
    [String(name).toLowerCase()]: values[ name ]
  }), {})
}

module.exports = toLowerKeys
