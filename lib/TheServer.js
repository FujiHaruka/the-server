/**
 * HTTP server for the-framework
 * @class TheServer
 * @param {Object} config
 */
'use strict'

const {SugoHub} = require('sugo-hub')
const {modularize, TheCtrl, Invocation} = require('the-controller-base')
const serversideRendering = require('./helpers/serversideRendering')
const langDetector = require('./helpers/langDetector')
const ctxRegister = require('./helpers/ctxRegister')
const rpcActor = require('./rpcActor')
const ConnectionStore = require('./ConnectionStore')
const SessionStore = require('./SessionStore')

const invokeAction = require('./helpers/invokeAction')
const toLowerKeys = require('./helpers/toLowerKeys')
const newClientId = require('./helpers/newClientId')
const rpcViaHttp = require('./helpers/rpcViaHttp')
const callbacksProxy = require('./helpers/callbacksProxy')
const {unlessProduction} = require('the-check')

const CALLBACK_EVENT_NAME = 'the:ctrl:callback'

const CONNECTION_OPEN = 'connection:open'
const CONNECTION_CLOSE = 'connection:close'

/** @lends TheServer  */
class TheServer extends SugoHub {
  constructor (config = {}) {
    const {
      redis = {host: '127.0.0.1', port: '6379', db: 1},
      static: staticDir,
      logFile = 'var/log/the-server.log',
      keys,
      scope = {},
      actors = {},
      injectors = {},
      endpoints = {},
      middlewares = [],
      html = false,
      langs = ['en']
    } = config

    const appScope = TheServer.appScope({config}, scope)
    if (actors.rpc) {
      throw new Error('You cannot set actor with key "rpc" since it is reserved')
    }
    const rpc = rpcActor(appScope, {
      onClientJoin: (callerKey, scope) => s.handleCallerJoin(callerKey, scope),
      onClientLeave: (callerKey) => s.handleCallerLeave(callerKey)
    })
    super({
      storage: {
        redis: toLowerKeys(redis)
      },
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
      s.server.use(serversideRendering(html, {appScope}))
    }
    s.appScope = appScope
    s.sessionStore = new SessionStore(s.storage)
    s.connectionStore = new ConnectionStore(s.storage)
    s.controllerCreators = {}

    s.server.use(rpcViaHttp(s))
  }

  /**
   * Load a controller
   * @param {function} ControllerClass - Controller class
   * @param {string} controllerName - Name to instantiate with
   */
  load (ControllerClass, controllerName) {
    const s = this

    unlessProduction(({ok}) => {
      ok(typeof ControllerClass !== 'string', 'ControllerClass must be an constructor')
      ok(typeof controllerName === 'string', 'controllerName must be string')
    })

    const {localActors} = s

    const creator = s.defineControllerCreator(ControllerClass, controllerName)
    localActors.rpc.register(creator, controllerName)
    s.controllerCreators[controllerName] = creator
  }

  /**
   * Invoke a controller action
   * @param {string} cid - Client id
   * @param {Object} invocation - Controller action invocation
   * @param {Object} [options={}] - Optional settings
   * @returns {*}
   */
  async invokeControllerAction (cid, invocation, options = {}) {
    const s = this
    const {sessionStore} = s
    let {before, after, rescue} = options
    invocation.target.callbacks = callbacksProxy({
      emitter: (name, args) => invocation.target.emit(CALLBACK_EVENT_NAME, {
        controller: invocation.target.name,
        name,
        args
      })
    })
    invocation.target.session = (await sessionStore.get(cid)) || {}
    const result = await invokeAction(invocation, {before, after, rescue})
    await sessionStore.set(cid, invocation.target.session)
    return result
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
    const {beforeInvocation: before, afterInvocation: after, rescueInvocation: rescue} = ControllerClass
    return function controllerCreator (app, client) {
      const {cid = newClientId(), callerKey} = (client || {})

      {
        const fromClient = client && (!client.via || (client.via === 'client'))
        if (fromClient) {
          unlessProduction(({ok}) => {
            ok(callerKey, `[TheServer] callerKey not found on client scope. Perhaps you need to use the-client@1.5 or later`)
          })
        }
      }

      let target = new ControllerModule({app, client, name: as})
      let {emit} = target
      Object.assign(target, {
        /**
         * Use another controller
         * @param {string} controllerName
         * @returns {Object}
         */
        useController (controllerName) {
          return s.createControllerFor(controllerName, app, client)
        },

        /**
         * Emit event to the client
         * @param {string} event - Event to emit
         * @param {Object} data - Data to emit
         */
        emit (event, data) {
          emit.call(target, event, data, {
            only: [callerKey]
          })
        },

        /**
         * Broad cast to all clients
         * @param {string} event - Event to emit
         * @param {Object} data - Data to emit
         */
        broadcast (event, data) {
          emit.call(target, event, data)
        },

        /**
         * Handler for controller load
         */
        controllerDidLoad () {

        },

        /**
         * Handler for controller unload
         */
        controllerWillUnload () {

        }
      })

      const onClose = ({key}) => {
        if (key !== callerKey) {
          return
        }
        target.controllerWillUnload()
        s.connectionStore.removeListener(CONNECTION_CLOSE, onClose)
        target = null
        emit = null
      }

      s.connectionStore.addListener(CONNECTION_CLOSE, onClose)

      const {methods} = target.$spec
      const creator = Object.keys(methods).reduce((bound, action) => Object.assign(bound, {
        [action]: function controllerActionProxy (...params) {
          if (!target) {
            throw new Error(`Controller "${as}" is already unloaded`)
          }
          target.$emitter = this.$emitter
          const invocation = new Invocation({target, action, params})
          return s.invokeControllerAction(cid, invocation, {before, after, rescue})
        }
      }), {})

      target.controllerDidLoad()
      return creator
    }
  }

  /**
   * Create an controller
   * @param {string} controllerName
   * @param {Object} app - App scope
   * @param {Object} client - Client scope
   * @returns {Object} - Controller instance
   */
  createControllerFor (controllerName, app, client) {
    const s = this
    let creator = s.controllerCreators[controllerName]
    if (!creator) {
      let known = s.knownControllerNames()
      throw new Error(`Unknown controller "${controllerName}"  (Available: ${JSON.stringify(known)}`)
    }
    return creator(app, client)
  }

  /**
   * Get known controller names
   * @returns {string[]} Name of controllers
   */
  knownControllerNames () {
    const s = this
    return Object.keys(s.controllerCreators)
  }

  async handleCallerJoin (callerKey, scope) {
    const s = this
    s.connectionStore.emit(CONNECTION_OPEN, {key: callerKey})
    await s.connectionStore.set(callerKey, scope)
  }

  async handleCallerLeave (callerKey) {
    const s = this
    s.connectionStore.emit(CONNECTION_CLOSE, {key: callerKey})
    await s.connectionStore.del(callerKey)
  }

  /**
   * Define an app scope object
   * @param {...Object} values - Values to set
   * @returns {Object} Defined scope
   */
  static appScope (...values) {
    const appScope = Object.assign({}, ...values, {})
    return Object.freeze(appScope)
  }
}

TheServer.Ctrl = TheCtrl

module.exports = TheServer
