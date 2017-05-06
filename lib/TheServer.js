'use strict'

const { SugoHub } = require('sugo-hub')
const { modularize, TheCtrl } = require('the-controller-base')
const serversideRendering = require('./helpers/serversideRendering')
const langDetector = require('./helpers/langDetector')
const ctxRegister = require('./helpers/ctxRegister')
const rpcActor = require('./rpcActor')
const SessionStore = require('./SessionStore')
const co = require('co')
const uuid = require('uuid')
const invokeAction = require('./helpers/invokeAction')

const newClientId = () => uuid.v4()

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
    s.sessionStore = new SessionStore(s.storage)
  }

  /**
   * Register a controller
   * @param {function} ControllerClass - Controller class
   * @param {string} controllerName - Name to instantiate with
   * @param {Object} [options={}]
   */
  register (ControllerClass, controllerName, options = {}) {
    const s = this
    const ControllerModule = modularize(ControllerClass)
    const { beforeInvocation, afterInvocation, rescueInvocation } = ControllerClass
    let creator = (app, client) => {
      let { cid = newClientId } = (client || {})
      let target = new ControllerModule({
        name: controllerName,
        app: app,
        client: client
      })
      let { methods } = target.$spec
      return Object.keys(methods).reduce((bound, action) => Object.assign(bound, {
        [action]: function methodInvoke (...params) {
          const invocation = { target, action, params }
          return s.invoke(cid, invocation, {
            before: beforeInvocation,
            after: afterInvocation,
            rescue: rescueInvocation
          })
        }
      }), {})
    }

    let { rpc } = s.localActors
    rpc.register(creator, controllerName)
  }

  invoke (cid, invocation, options = {}) {
    const s = this
    const { sessionStore } = s
    let { before, after, rescue } = options
    return co(function * () {
      invocation.target.session = (yield sessionStore.get(cid)) || {}
      let result = yield invokeAction(invocation, {
        before,
        after,
        rescue
      })
      yield sessionStore.set(cid, invocation.target.session)
      return result
    })
  }

}

TheServer.Ctrl = TheCtrl

module.exports = TheServer
