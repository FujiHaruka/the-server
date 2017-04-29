'use strict'

import { SugoHub } from 'sugo-hub'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import scopedActor from './helpers/scopedActor'

/**
 * HTTP server for the-framework
 */
class TheServer extends SugoHub {
  constructor (config = {}) {
    let {
      storage = { redis: { host: '127.0.0.1', port: '6379', db: 1 } },
      static: staticDir,
      rpc: rpcCreators = {},
      middlewares,
      logFile = 'var/log/the-server.log',
      keys,
      scope = {}
    } = config

    let appScope = Object.freeze(Object.assign({ config }, scope))
    let rpc = scopedActor(appScope, rpcCreators)
    super({
      storage,
      static: staticDir,
      localActors: { rpc },
      middlewares,
      logFile,
      keys
    })
  }
}

export default TheServer
