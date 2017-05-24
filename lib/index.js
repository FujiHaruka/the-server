/**
 * HTTP server of the-framework
 * @module the-server
 */
'use strict'

const TheServer = require('./TheServer')
const create = require('./create')
const utils = require('./utils')

const lib = create.bind(this)

Object.assign(lib, TheServer, {
  TheServer,
  create,
  utils
})

module.exports = lib
