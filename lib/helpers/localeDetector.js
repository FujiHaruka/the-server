/**
 * Define koa middleware function to detect locale
 * @function localeDetector
 * @param {string[]} [locales='en'] - Supported locales
 * @returns {function}
 */
'use strict'

const { Locales } = require('locale')

/** @lends localeDetector */
function localeDetector (locales) {
  let supported = new Locales(locales)
  return function middleware (ctx, next) {
    let locales = new Locales(ctx.get('accept-localeuage'))
    let detected = locales.best(supported)
    let specified = ctx.params.locale || ctx.query.locale
    ctx.locale = specified || detected
    next()
  }
}

module.exports = localeDetector
