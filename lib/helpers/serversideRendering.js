/**
 * Define koa middleware function to do serverside rendering
 * @function serverRendering
 * @param {function} Component - React component to render
 * @param {Object} [options={}] - Optional settings
 * @returns {function} Koa middleware function
 */
'use strict'

const {renderToStaticMarkup} = require('react-dom/server')
const {createElement: c} = require('react')
const path = require('path')

const d = (module) => (module && module.default) || module

/** @function serverRendering */
function serverRendering (Html, options = {}) {
  const {
    defaultStatus = 200,
    appScope
  } = options
  return function middleware (ctx, next) {
    const extname = path.extname(ctx.path)
    const mayHTML = !extname || ['.html', '.htm'].includes(extname)
    if (!mayHTML) {
      next()
      return
    }

    const clientScope = Object.assign({}, ctx)
    const renderingContext = {}

    const element = c(
      d(Html),
      Object.assign({appScope, clientScope, renderingContext})
    )

    ctx.body = renderToStaticMarkup(element)
    ctx.status = renderingContext.status || defaultStatus
  }
}

module.exports = serverRendering
