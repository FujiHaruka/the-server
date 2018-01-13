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
const ctxInjector = require('./helpers/ctxInjector')
const rpcActor = require('./rpcActor')
const ConnectionPool = require('./ConnectionPool')
const SessionStore = require('./SessionStore')

const invokeAction = require('./helpers/invokeAction')
const toLowerKeys = require('./helpers/toLowerKeys')
const newClientId = require('./helpers/newClientId')
const rpcViaHttp = require('./helpers/rpcViaHttp')
const callbacksProxy = require('./helpers/callbacksProxy')
const {unlessProduction} = require('the-check')

const CALLBACK_EVENT_NAME = 'the:ctrl:callback'

/** @lends TheServer  */
class TheServer extends SugoHub {
  constructor (config = {}) {
    const {
      redis = {host: '127.0.0.1', port: '6379', db: 1},
      static: staticDir,
      logFile = 'var/log/the-server.log',
      cacheDir = 'tmp/cache',
      keys,
      scope = {},
      actors = {},
      injectors = {},
      endpoints = {},
      middlewares = [],
      html = false,
      langs = ['en'],
      setup,
      teardown
    } = config

    const appScope = TheServer.appScope({config}, scope)
    if (actors.rpc) {
      throw new Error('You cannot set actor with key "rpc" since it is reserved')
    }
    const rpc = rpcActor(appScope, {
      onClientJoin: (callerKey, scope) => connectionPool.createConnection(callerKey, scope),
      onClientLeave: (callerKey) => connectionPool.destroyConnection(callerKey)
    })
    const connectionPool = new ConnectionPool()
    super({
      storage: {
        redis: toLowerKeys(redis)
      },
      static: staticDir,
      localActors: Object.assign({}, actors, {
        rpc
      }),
      middlewares: [
        ctxInjector(injectors),
        langDetector(langs),
        ...middlewares
      ],
      setup () {
        setup && setup()
      },
      teardown () {
        connectionPool.destroyAllConnections()
        teardown && teardown()
      },
      endpoints,
      logFile,
      keys
    })
    if (html) {
      const renderer = serversideRendering(html, {appScope, cacheDir})
      renderer.clearCacheSync()
      this.server.use(renderer)
    }
    this.appScope = appScope
    this.sessionStore = new SessionStore(this.storage)
    this.connectionPool = connectionPool
    this.controllerCreators = {}

    this.server.use(rpcViaHttp(this))
  }

  /**
   * Load a controller
   * @param {function} ControllerClass - Controller class
   * @param {string} controllerName - Name to instantiate with
   */
  load (ControllerClass, controllerName) {
    unlessProduction(({ok}) => {
      ok(typeof ControllerClass !== 'string', 'ControllerClass must be an constructor')
      ok(typeof controllerName === 'string', 'controllerName must be string')
    })

    const {localActors} = this

    const creator = this.defineControllerCreator(ControllerClass, controllerName)
    localActors.rpc.register(creator, controllerName)
    this.controllerCreators[controllerName] = creator
  }

  /**
   * Load all controllers
   * @param {Object.<string, function>} ControllerMappings - Controller constructors
   */
  loadFromMappings (ControllerMappings) {
    for (const [name, Controller] of Object.entries(ControllerMappings)) {
      this.load(Controller, name)
    }
  }

  /**
   * Invoke a controller action
   * @param {string} cid - Client id
   * @param {Object} invocation - Controller action invocation
   * @param {Object} [options={}] - Optional settings
   * @returns {*}
   */
  async invokeControllerAction (cid, invocation, options = {}) {
    const {sessionStore} = this
    const {before, after, rescue} = options

    invocation.target.callbacks = callbacksProxy({
      emitter: (name, args) => {
        if (!invocation.target.emit) {
          return
        }
        invocation.target.emit(CALLBACK_EVENT_NAME, {
          controller: invocation.target.name,
          name,
          args
        })
      }
    })
    invocation.target.session = (await sessionStore.get(cid)) || {}

    invocation.target.reloadSession = async () => {
      invocation.target.session = (await sessionStore.get(cid)) || {}
    }
    invocation.target.saveSession = async () => {
      await sessionStore.set(cid, invocation.target.session)
    }
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
    const {connectionPool} = this
    const ControllerModule = modularize(ControllerClass)
    const {beforeInvocation: before, afterInvocation: after, rescueInvocation: rescue} = ControllerClass
    const decorateControllerModule = this.decorateControllerModule.bind(this)
    const invokeControllerAction = this.invokeControllerAction.bind(this)
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

      const connection = callerKey && connectionPool.getConnection(callerKey)
      if (connection) {
        const known = connection.getController(as)
        if (known) {
          return known
        }
      }
      const target = decorateControllerModule(
        new ControllerModule({app, client, name: as}),
        {app, client, callerKey}
      )

      const {methods} = target.$spec
      const controller = Object.keys(methods)
        .filter((action) => !!methods[action])
        .reduce((bound, action) => Object.assign(bound, {
          [action]: async function controllerActionProxy (...params) {
            if (!target) {
              throw new Error(`Controller "${as}" is already unloaded`)
            }
            target.$emitter = this.$emitter
            const invocation = new Invocation({target, action, params})
            return invokeControllerAction(cid, invocation, {before, after, rescue})
          }
        }), {})

      if (connection) {
        connection.loadController(as, controller)
        const onunload = (unloaded) => {
          if (unloaded.name !== as) {
            return
          }
          target.emit = null
          connection.removeListener('unload', onunload)
        }
        connection.addListener('unload', onunload)
      }
      return controller
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
    const creator = this.controllerCreators[controllerName]
    if (!creator) {
      const known = this.knownControllerNames()
      throw new Error(`Unknown controller "${controllerName}"  (Available: ${JSON.stringify(known)}`)
    }
    return creator(app, client)
  }

  /**
   * Decorate controller module with server methods
   * @param {Object} target
   * @param {Object} context
   * @returns {*}
   */
  decorateControllerModule (target, {app, client, callerKey}) {
    const createControllerFor = this.createControllerFor.bind(this)
    const {emit} = target
    Object.assign(target, {
      /**
       * Use another controller
       * @param {string} controllerName
       * @returns {Object}
       */
      useController (controllerName) {
        return createControllerFor(controllerName, app, client)
      },

      /**
       * Emit event to the client
       * @param {string} event - Event to emit
       * @param {Object} data - Data to emit
       */
      emit (event, data) {
        if (!emit) {
          return
        }
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
      }
    })
    return target
  }

  /**
   * Get known controller names
   * @returns {string[]} Name of controllers
   */
  knownControllerNames () {
    return Object.keys(this.controllerCreators)
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
