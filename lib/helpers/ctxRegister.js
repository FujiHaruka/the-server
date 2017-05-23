/**
 * Define koa middleware register ctx values
 * @function ctxRegister
 * @param {function} creators
 * @returns {function}
 */
'use strict'

const co = require('co')

/** @lends ctxRegister */
function ctxRegister (creators) {
  return function middleware (ctx, next) {
    return co(function * () {
      Object.assign(
        ctx,
        ...Object.keys(creators).map((name) => ({
          [name]: creators[ name ](ctx)
        }))
      )
      yield next()
    })
  }
}

module.exports = ctxRegister
