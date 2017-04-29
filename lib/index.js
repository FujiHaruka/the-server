/**
 * HTTP server of the-framework
 * @module the-server
 */
'use strict'

const TheServer = require('./TheServer')
const create = require('./create')

const lib = create.bind(this)

Object.assign(lib, {
  TheServer,
  create
})

module.exports = lib

