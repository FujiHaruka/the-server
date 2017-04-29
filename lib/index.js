/**
 * HTTP server of the-framework
 * @module the-server
 */
'use strict'

const TheServer = require('./TheServer')
const create = require('./create')

module.exports = TheServer

export {
  TheServer,
  create
}
