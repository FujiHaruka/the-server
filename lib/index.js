/**
 * HTTP server of the-framework
 * @module the-server
 */
'use strict'

const _d = (m) => 'default' in m ? m.default : m

const ConnectionPool = _d(require('./ConnectionPool'))
const SessionStore = _d(require('./SessionStore'))
const TheServer = _d(require('./TheServer'))
const buildInEndpoints = _d(require('./buildInEndpoints'))
const create = _d(require('./create'))
const rpcActor = _d(require('./rpcActor'))
const utils = _d(require('./utils'))

module.exports = {
  ConnectionPool,
  SessionStore,
  TheServer,
  buildInEndpoints,
  create,
  rpcActor,
  utils,
  default: create,
}
