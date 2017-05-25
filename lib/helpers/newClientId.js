'use strict'

const uuid = require('uuid')

/** Generate new client id */
function newClientId () {
  return uuid.v4()
}

module.exports = newClientId
