/**
 * Define koa middleware function to do serverside rendering
 * @function serverRendering
 * @param {function} Component - React component to render
 * @param {Object} [options={}] - Optional settings
 * @returns {function}
 */
'use strict'

const { renderToStaticMarkup } = require('react-dom/server')
const { TheRouter } = require('the-router')
const { createElement: c } = require('react')

const d = (module) => module && module.default || module

/** @function serverRendering */
function serverRendering (Html, App, options = {}) {
  let {
    defaultStatus = 200,
    appScope
  } = options
  return function middleware (ctx, next) {
    const clientScope = Object.assign(ctx)
    const renderingContext = {}

    let element = c(
      d(Html),
      Object.assign({ appScope, clientScope }),
      c(
        d(TheRouter).Static,
        {
          location: ctx.url,
          context: renderingContext
        },
        c(d(App), { appScope, clientScope })
      )
    )

    ctx.body = renderToStaticMarkup(element)
    ctx.status = renderingContext.status || defaultStatus
  }
}

module.exports = serverRendering
