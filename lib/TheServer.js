'use strict'

const { SugoHub } = require('sugo-hub')
const serversideRendering = require('./helpers/serversideRendering')
const langDetector = require('./helpers/langDetector')
const scopedActor = require('./helpers/scopedActor')

/**
 * HTTP server for the-framework
 */
class TheServer extends SugoHub {
  constructor (config = {}) {
    let {
      redis = { host: '127.0.0.1', port: '6379', db: 1 },
      static: staticDir,
      rpc: rpcCreators = {},
      logFile = 'var/log/the-server.log',
      keys,
      scope = {},
      html,
      langs = [ 'en' ]
    } = config

    let appScope = Object.freeze(Object.assign({ config }, scope))
    super({
      storage: { redis },
      static: staticDir,
      localActors: {
        rpc: scopedActor(appScope, rpcCreators)
      },
      middlewares: [
        langDetector(langs)
      ],
      logFile,
      keys
    })
    const s = this
    s.server.use(serversideRendering(html, { appScope }))
  }

  static create () {
    return new TheServer(...arguments)
  }
}

module.exports = TheServer
