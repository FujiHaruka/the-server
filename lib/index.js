/**
 * HTTP server of the-framework
 * @module the-server
 */
'use strict'

const TheServer = require('./TheServer')
const create = require('./create')
const asleep = require('asleep')
const aport = require('aport')

const lib = create.bind(this)

Object.assign(lib, TheServer, {
  TheServer,
  create,
  utils: {
    asleep,
    aport
  }
})

module.exports = lib
