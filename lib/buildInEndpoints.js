/**
 * Build in endpoints
 * @module buildInEndpoints
 */
'use strict'

module.exports = {
  '/the/ping': async (ctx) => {
    ctx.status = 200
    ctx.body = 'pong'
  },
  '/the/info': async (ctx) => {
    const {server} = ctx
    ctx.status = 200
    ctx.body = {
      alive: true,
      uptime: new Date() - server.listenAt,
      controllers: server.knownControllerNames,
      langs: server.langs,
    }
  }
}