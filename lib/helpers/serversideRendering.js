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
const path = require('path')

const d = (module) => module && module.default || module

/** @function serverRendering */
function serverRendering (Html, options = {}) {
  let {
    defaultStatus = 200,
    appScope
  } = options
  return function middleware (ctx, next) {
    const clientScope = Object.assign(ctx)
    const renderingContext = {}

    let { url } = ctx
    let extname = path.extname(url)

    let mayHTML = !extname || [ '.html', '.htm' ].includes(extname)
    if (!mayHTML) {
      next()
      return
    }

    let element = c(
      d(Html),
      Object.assign({ appScope, clientScope, renderingContext })
    )

    ctx.body = renderToStaticMarkup(element)
    ctx.status = renderingContext.status || defaultStatus
  }
}

module.exports = serverRendering
