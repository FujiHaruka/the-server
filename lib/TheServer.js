'use strict'

const { SugoHub } = require('sugo-hub')
const serversideRendering = require('./helpers/serversideRendering')
const scopedActor = require('./helpers/scopedActor')

/**
 * HTTP server for the-framework
 */
class TheServer extends SugoHub {
  constructor (config = {}) {
    let {
      storage = { redis: { host: '127.0.0.1', port: '6379', db: 1 } },
      static: staticDir,
      rpc: rpcCreators = {},
      logFile = 'var/log/the-server.log',
      keys,
      scope = {},
      html,
      app
    } = config

    let appScope = Object.freeze(Object.assign({ config }, scope))
    let rpc = scopedActor(appScope, rpcCreators)
    super({
      storage,
      static: staticDir,
      localActors: { rpc },
      middlewares: [
        serversideRendering(html, app)
      ],
      logFile,
      keys
    })
  }

  static create () {
    return new TheServer(...arguments)
  }
}

module.exports = TheServer
