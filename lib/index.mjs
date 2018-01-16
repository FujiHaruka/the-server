/**
 * HTTP server of the-framework
 * @module the-server
 */
'use strict'

import ConnectionPool from './ConnectionPool'
import SessionStore from './SessionStore'
import TheServer from './TheServer'
import buildInEndpoints from './buildInEndpoints'
import create from './create'
import rpcActor from './rpcActor'
import utils from './utils'

export {
  ConnectionPool,
  SessionStore,
  TheServer,
  buildInEndpoints,
  create,
  rpcActor,
  utils,
}

export default create
