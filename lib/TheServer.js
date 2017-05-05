'use strict'

const { SugoHub } = require('sugo-hub')
const { modularize } = require('sugo-module-base')
const serversideRendering = require('./helpers/serversideRendering')
const langDetector = require('./helpers/langDetector')
const ctxRegister = require('./helpers/ctxRegister')
const rpcActor = require('./rpcActor')

const TheServerClient = require('./TheServerClient')

/**
 * HTTP server for the-framework
 */
class TheServer extends SugoHub {
  constructor (config = {}) {
    let {
      redis = { host: '127.0.0.1', port: '6379', db: 1 },
      static: staticDir,
      logFile = 'var/log/the-server.log',
      keys,
      scope = {},
      store = () => null,
      middlewares = [],
      html,
      langs = [ 'en' ]
    } = config

    let appScope = Object.freeze(Object.assign({ config }, scope))
    let rpc = rpcActor(appScope)
    super({
      storage: { redis },
      static: staticDir,
      localActors: {
        rpc
      },
      middlewares: [
        ctxRegister({
          store
        }),
        langDetector(langs),
        ...middlewares
      ],
      logFile,
      keys
    })
    const s = this
    s.server.use(serversideRendering(html, { appScope }))

    s.clients = {}
  }

  /**
   * Register a controller
   * @param {function} ControllerClass - Controller class
   * @param {string} as - Name to instantiate with
   * @param {Object} [options={}]
   */
  register (ControllerClass, as, options = {}) {
    const s = this
    let { rpc } = s.localActors
    let ControllerModule = modularize(ControllerClass)
    let creator = (appScope, clientScope) => {
      s.invalidate()

      let { cid = TheServerClient.newCID() } = clientScope || {}

      let client = s.clientFor(cid).keepAlive()
      let controller = client.getController(as)
      if (!controller) {
        controller = new ControllerModule({
          app: appScope,
          client: clientScope
        })
        client.setController(as, controller)
      }
      let { methods } = controller.$spec
      return Object.keys(methods).reduce((bound, name) => Object.assign(bound, {
        [name]: (...args) => controller[ name ](...args)
      }), {})
    }

    rpc.register(creator, as)
  }

  clientFor (cid) {
    const s = this
    let client = s.clients[ cid ]
    if (client && client.alive) {
      return client
    }
    client = new TheServer.Client(cid)
    s.clients[ cid ] = client
    return client
  }

  invalidate () {
    const s = this
    if (s._invalidateTimer) {
      return
    }
    s._invalidateTimer = setTimeout(() => {
      delete s._invalidateTimer
      let clientKeys = Object.keys(s.clients)
      for (let key of clientKeys) {
        let client = s.clients[ key ]
        if (!client.alive) {
          delete s.clients[ key ]
        }
      }
    }, 10).unref()
  }
}

TheServer.Client = TheServerClient

module.exports = TheServer
