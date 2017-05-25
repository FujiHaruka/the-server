/**
 * Define handle to invoke rpc functions via http request
 * @function rpcViaHttp
 * @param {TheServer} - Server instance
 * @param {Object} [options={}] - Optional settings
 * @returns {function} Koa middleware function
 */
'use strict'

const co = require('co')
const newClientId = require('./newClientId')
const { camelcase } = require('stringcase')

/** @lends rpcViaHttp */
function rpcViaHttp (server, options = {}) {
  let { urlPrefix = '/rpc' } = options

  return function middleware (ctx, next) {
    let { path } = ctx
    return co(function * () {
      let isRPC = path.indexOf(urlPrefix) === 0
      if (!isRPC) {
        yield next()
        return
      }
      let [ , , controllerName, actionName, ...params ] = path.split('/')
      let isKnownController = server.knownControllerNames().includes(controllerName)
      if (!isKnownController) {
        yield next()
        return
      }
      let { cookies } = ctx
      let data = Object.assign({}, ctx.query, ctx.request.body, ctx.params)
      let { cid = cookies.get('cid') || newClientId() } = data
      cookies.set('cid', cid)
      let app = server.appScope
      let client = { cid }
      let controller = server.createControllerFor(controllerName, app, client)
      let action = controller[ actionName ] || controller[ camelcase(actionName) ]
      if (!action) {
        yield next()
        return
      }
      try {
        let result = yield Promise.resolve(action.call(controller, ...params))
        ctx.status = 200
        ctx.body = result
      } catch (e) {
        ctx.status = 400
        ctx.body = e.message
      }
    })
  }
}

module.exports = rpcViaHttp
