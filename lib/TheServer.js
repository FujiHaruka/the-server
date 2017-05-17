/**
 * HTTP server for the-framework
 * @class TheServer
 * @param {Object} config
 */
'use strict'

const { SugoHub } = require('sugo-hub')
const { modularize, TheCtrl, Invocation } = require('the-controller-base')
const serversideRendering = require('./helpers/serversideRendering')
const langDetector = require('./helpers/langDetector')
const ctxRegister = require('./helpers/ctxRegister')
const rpcActor = require('./rpcActor')
const SessionStore = require('./SessionStore')
const co = require('co')
const uuid = require('uuid')
const invokeAction = require('./helpers/invokeAction')
const { unlessProduction } = require('the-check')

const newClientId = () => uuid.v4()

/** @lends TheServer  */
class TheServer extends SugoHub {
  constructor (config = {}) {
    let {
      redis = { host: '127.0.0.1', port: '6379', db: 1 },
      static: staticDir,
      logFile = 'var/log/the-server.log',
      keys,
      scope = {},
      actors = {},
      injectors = {},
      endpoints = {},
      middlewares = [],
      html = false,
      langs = [ 'en' ]
    } = config

    let appScope = TheServer.appScope({ config }, scope)
    if (actors.rpc) {
      throw new Error('You cannot set actor with key "rpc" since it is reserved')
    }
    let rpc = rpcActor(appScope)
    super({
      storage: { redis },
      static: staticDir,
      localActors: Object.assign({}, actors, {
        rpc
      }),
      middlewares: [
        ctxRegister(injectors),
        langDetector(langs),
        ...middlewares
      ],
      endpoints,
      logFile,
      keys
    })
    const s = this
    if (html) {
      s.server.use(serversideRendering(html, { appScope }))
    }
    s.appScope = appScope
    s.sessionStore = new SessionStore(s.storage)
  }

  /**
   * Load a controller
   * @param {function} ControllerClass - Controller class
   * @param {string} controllerName - Name to instantiate with
   */
  load (ControllerClass, controllerName) {
    const s = this

    unlessProduction(({ ok }) => {
      ok(typeof ControllerClass !== 'string', 'ControllerClass must be an constructor')
      ok(typeof controllerName === 'string', 'controllerName must be string')
    })

    const { localActors, appScope } = s

    let creator = s.defineControllerCreator(ControllerClass, controllerName)
    localActors.rpc.register(creator, controllerName)
    appScope.controllerCreators[ controllerName ] = creator
  }

  /** @deprecated */
  register () {
    console.warn('`TheServer#register` is now deprecated. Use `TheServer#register` instead.')
    return this.load(...arguments)
  }

  /**
   * Invoke a controller action
   * @param {string} cid - Client id
   * @param {Object} invocation - Controller action invocation
   * @param {Object} [options={}] - Optional settings
   * @returns {*}
   */
  invokeControllerAction (cid, invocation, options = {}) {
    const s = this
    const { sessionStore } = s
    let { before, after, rescue } = options
    return co(function * () {
      invocation.target.session = (yield sessionStore.get(cid)) || {}
      let result = yield invokeAction(invocation, { before, after, rescue })
      yield sessionStore.set(cid, invocation.target.session)
      return result
    })
  }

  /**
   * Define a controller creators
   * @param {function} ControllerClass - Class of controller
   * @param {string} as - Name as
   * @returns {function} Controller creator function
   */
  defineControllerCreator (ControllerClass, as = ControllerClass.name) {
    const s = this
    const ControllerModule = modularize(ControllerClass)
    const { beforeInvocation: before, afterInvocation: after, rescueInvocation: rescue } = ControllerClass
    return function controllerCreator (app, client) {
      let { cid = newClientId() } = (client || {})
      let target = new ControllerModule({ app, client, name: as })
      let { methods } = target.$spec
      return Object.keys(methods).reduce((bound, action) => Object.assign(bound, {
        [action]: function controllerActionProxy (...params) {
          const invocation = new Invocation({ target, action, params })
          return s.invokeControllerAction(cid, invocation, { before, after, rescue })
        }
      }), {})
    }
  }

  /**
   * Define an app scope object
   * @param {...Object} values - Values to set
   * @returns {Object} Defined scope
   */
  static appScope (...values) {
    const appScope = Object.assign({}, ...values, { controllerCreators: {} })
    return Object.freeze(appScope)
  }
}

TheServer.Ctrl = TheCtrl

module.exports = TheServer
