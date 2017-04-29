/**
 * Define koa middleware function to do serverside rendering
 * @function serversideRendering
 * @param {function} Component - React component to render
 * @param {Object} [options={}] - Optional settings
 * @returns {function}
 */
'use strict'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Router } from 'the-router'

/** @function serversideRendering */
function serversideRendering (Html, App, options = {}) {
  let {
    defaultStatus = 200
  } = options
  return function middleware (ctx, next) {
    const renderingContext = {}

    let element = (
      <Html>
      <Router.static location={ctx.url}
                     context={renderingContext}>
        <App/>
      </Router.static>
      </Html>
    )

    ctx.body = renderToStaticMarkup(element)
    ctx.status = renderingContext.status || defaultStatus
  }
}

export default serversideRendering
