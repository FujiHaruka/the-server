/**
 * Define koa middleware register ctx values
 * @function ctxRegister
 * @param {function} creators
 * @returns {function}
 */
'use strict'

/** @lends ctxRegister */
function ctxRegister (creators) {
  return function middleware (ctx, next) {
    Object.assign(
      ctx,
      ...Object.keys(creators).map((name) => ({
        [name]: creators[ name ](ctx)
      }))
    )
    next()
  }
}

module.exports = ctxRegister
