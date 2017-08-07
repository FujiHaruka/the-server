/**
 * Define koa middleware register ctx values
 * @function ctxRegister
 * @param {function} creators
 * @returns {function}
 */
'use strict'

/** @lends ctxRegister */
function ctxRegister (creators) {
  return async function middleware (ctx, next) {
    Object.assign(
      ctx,
      ...Object.keys(creators).map((name) => ({
        [name]: creators[name](ctx)
      }))
    )
    await next()
  }
}

module.exports = ctxRegister
