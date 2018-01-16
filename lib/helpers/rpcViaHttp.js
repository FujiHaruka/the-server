/**
 * Define handle to invoke rpc functions via http request
 * @function rpcViaHttp
 * @param {TheServer} - Server instance
 * @param {Object} [options={}] - Optional settings
 * @returns {function} Koa middleware function
 */
'use strict'

const newClientId = require('./newClientId')
const {camelcase} = require('stringcase')

/** @lends rpcViaHttp */
function rpcViaHttp (server, options = {}) {
  const {urlPrefix = '/rpc'} = options

  return async function middleware (ctx, next) {
    const {path} = ctx
    const isRPC = path.indexOf(urlPrefix) === 0
    if (!isRPC) {
      await next()
      return
    }
    const [, , controllerName, actionName, ...params] = path.split('/')
    const isKnownController = server.knownControllerNames.includes(controllerName)
    if (!isKnownController) {
      await next()
      return
    }
    const {cookies} = ctx
    const data = Object.assign({}, ctx.query, ctx.request.body, ctx.params)
    const {cid = cookies.get('cid') || newClientId()} = data
    cookies.set('cid', cid)
    const app = server.appScope
    const client = {cid, via: 'http'}
    const controller = server.createControllerFor(controllerName, app, client)
    const action = controller[actionName] || controller[camelcase(actionName)]
    if (!action) {
      await next()
      return
    }
    try {
      const result = await Promise.resolve(action.call(controller, ...params))
      ctx.status = 200
      ctx.body = result
    } catch (e) {
      ctx.status = 400
      ctx.body = e.message
    }
  }
}

module.exports = rpcViaHttp
